public class MergeSort {

    private static final String ANSI_RED = "\u001B[32m";
    private static final String ANSI_RESET = "\u001B[0m";
    
    public static void main(String[] args) {
        int[] arr = {8,7,6,5,4,3,2,1};
        System.out.println("============ DIVIDE ===============\n");
        
        mergesort(arr, 0, arr.length - 1);
    }

    private static void mergesort(int[] arr, int from, int to) {
        // base case -> single element
        if (from >= to) {
            return;
        }
        
        // split current array into two: left and right
        var mid = (from + to) / 2;
        System.out.println("LEFT: from = " + from + ", to = " +mid);
        System.out.println("RIGHT: from = " + (mid + 1) + ", to = " +to);
        mergesort(arr, from, mid);
        mergesort(arr, mid + 1, to);

        // conquer
        System.out.println(ANSI_RED);
        System.out.printf("============ CONQUER from %d to %d ===============%n" + ANSI_RED, from, to);
        merge(arr, from, to, mid);
        System.out.printf("============ FINISHED CONQUER from %d to %d ===============%n", from, to);
        System.out.println(ANSI_RESET);
    }

    private static void merge(int[] arr, int from, int to, int mid) {
        // split arr into to piles
        final int[] left = Arrays.copyOfRange(arr, from, mid + 1);
        final int[] right = Arrays.copyOfRange(arr, mid + 1, to + 1);
        System.out.println("L=" + Arrays.stream(left).boxed().toList() + ", R=" + Arrays.stream(right).boxed().toList());

        int[] merged = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;
        
        while(i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                merged[k] = left[i];
                i++;
            } else {
                merged[k] = right[j];
                j++;
            }
            k++;
        }
        
        if (i < left.length) {
            while (i < left.length) {
                merged[k] = left[i];
                k++;
                i++;
            }
        } else {
            while (j < right.length) {
                merged[k] = left[j];
                k++;
                j++;
            }
        }

        System.arraycopy(merged, 0, arr, from, merged.length);

        System.out.println("arr = " + Arrays.stream(arr).boxed().toList());
    }

}
