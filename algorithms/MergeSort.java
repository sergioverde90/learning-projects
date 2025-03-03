public class MergeSort {

    private static final String ANSI_RED = "\u001B[32m";
    private static final String ANSI_RESET = "\u001B[0m";
    
    public static void main(String[] args) {
        int[] arr = {12, 56, 34, 2,  45, 6 , 8, 98};
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
        merge(arr, from, to);
        System.out.printf("============ FINISHED CONQUER from %d to %d ===============%n", from, to);
        System.out.println(ANSI_RESET);
    }

    private static void merge(int[] arr, int from, int to) {
        // split arr into to piles
        final double mid = Math.floor((from + (double) to) / 2);
        final int[] left = Arrays.copyOfRange(arr, from, (int) mid + 1);
        final int[] right = Arrays.copyOfRange(arr, ((int) mid) + 1, to + 1);
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
                merged[k] = right[j];
                k++;
                j++;
            }
        }

        System.arraycopy(merged, 0, arr, from, merged.length);

        System.out.println("arr = " + Arrays.stream(arr).boxed().toList());
    }

}
