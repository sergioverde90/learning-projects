import java.awt.*;
import java.awt.datatransfer.*;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.Console;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * TODO: accept a second argument in the retrieve function to accept a key to retrieve instead ask from terminal
 */
public class PassHash {

    private static final Cipher CIPHER;
    private static final MessageDigest SHA;
    public static final String SPLIT_STR = "#";

    static {
        try {
            CIPHER = Cipher.getInstance("AES/GCM/NoPadding");
            SHA = MessageDigest.getInstance("SHA-256");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.out.println("generate or retrieve parameters required.");
            System.exit(0);
        }

        String keystore = promptMessage("Enter the keystore location: ./keystore (default)");
        if (keystore == null || keystore.length() == 0) keystore = "./keystore";
        final Path keystorePath = Paths.get(keystore);

        if (!Files.exists(keystorePath)) {
            String ans = promptMessage("Keystore file does not exist, do you want to create a new one? [Y/n]: ");
            if ("Y".equals(ans) || "yes".equals(ans)) { Files.createFile(keystorePath); }
            else System.exit(0);
        }

        if (args[0].equals("retrieve")) {
            final String mapKey = args.length == 2 ? args[1] : promptMessage("Enter the code: ");
            final String pass = promptPassword("Enter password: ");
            retrieve(keystore, mapKey, pass);
        } else if (args[0].equals("generate")) {
            final String mapKey = promptMessage("Enter the code: ");
            final String pass1 = promptPassword("Enter password: ");
            final String pass2 = promptPassword("Confirm password: ");
            if (!pass1.equals(pass2)) {
                System.out.println("passwords do not match");
                System.exit(0);
            }
            generate(keystore, mapKey, pass1);
            retrieve(keystore, mapKey, pass1);
        } else {
            System.out.println("Could not recognize option '" + args[0] + "'");
            System.exit(0);
        }
    }

    private static void generate(String keystore, String associatedKey, String pass) throws Exception {
        // ENCRYPTION PROCESS
        final byte[] keyBytes = cypherPass(pass);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        final byte[] iv = generateIV();
        CIPHER.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
        byte[] encryptedData = CIPHER.doFinal(generateRandomPass());

        // ENCODE TO B64
        final Base64.Encoder encoder = Base64.getEncoder();
        final byte[] encoded = encoder.encode(encryptedData);
        final byte[] iv64 = encoder.encode(iv);
        final String toWrite = associatedKey + " " + new String(encoded) + SPLIT_STR + new String(iv64);

        final Path passhash = Paths.get(keystore);
        try (final BufferedWriter bufferedWriter = Files.newBufferedWriter(passhash, StandardOpenOption.APPEND)) {
            bufferedWriter.write(toWrite);
            bufferedWriter.newLine();
        }
    }

    private static void retrieve(String keystore, String mapKey, String pass) throws Exception {
        final Path passhash = Paths.get(keystore);

        try(final BufferedReader bufferedReader = Files.newBufferedReader(passhash)) {
            final String[] b64cypherText = bufferedReader.lines()
                    .filter(l -> l.startsWith(mapKey)).findFirst()
                    .orElseThrow().split(" ")[1].split(SPLIT_STR);

            final byte[] keyBytes = cypherPass(pass);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

            // DECODE B64
            final Base64.Decoder decoder = Base64.getDecoder();
            final byte[] cypherText = decoder.decode(b64cypherText[0].getBytes());
            final byte[] b64iv = b64cypherText[1].getBytes();
            final byte[] iv = decoder.decode(b64iv);

            // DECRYPT PROCESS
            var paraSpec = new GCMParameterSpec(128, iv);
            CIPHER.init(Cipher.DECRYPT_MODE, secretKey, paraSpec);
            byte[] decryptedData = CIPHER.doFinal(cypherText);

            // Copy result to the clipboard
            Toolkit toolkit = Toolkit.getDefaultToolkit();
            Clipboard clipboard = toolkit.getSystemClipboard();
            StringSelection selection = new StringSelection(new String(decryptedData));
            clipboard.setContents(selection, null);
        }

    }

    private static byte[] cypherPass(String pass) {
        byte[] keyBytes = SHA.digest(pass.getBytes()); // ensure 32 bytes hash
        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
        return secretKey.getEncoded();
    }

    private static byte[] generateRandomPass() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$%&*!";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        int passwordLength = 18;

        for (int i = 0; i < passwordLength; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString().getBytes();
    }

    private static byte[] generateIV() {
        byte[] iv = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        return iv;
    }

    private static String promptMessage(String s) {
        final Console console = checkConsoleAvailableOrError();
        return String.valueOf(console.readLine(s));
    }

    private static String promptPassword(String s) {
        final Console console = checkConsoleAvailableOrError();
        return String.valueOf(console.readPassword(s));
    }

    private static Console checkConsoleAvailableOrError() {
        Console console = System.console();
        if (console == null) {
            System.out.println("Couldn't get Console instance. Are you running from an IDE? Run it from a console please.");
            System.exit(0);
        }

        return console;
    }

}