public class InsertionSort {

    public static void main(String[] args) {
        final int[] arr = {9,5,2,3,8,4,1,6,7};
        insertionsort(arr);

        System.out.println("arr = " + Arrays.stream(arr).boxed().toList());
    }
    
    private static void insertionsort(int[] arr) {
        for (int j = 1; j < arr.length; j++) {
            int i = j - 1;
            while (i >= 0 && arr[i] > arr[i+1]) { 
                swap(arr, i, i+1);
                i--;
            }
            // while loop analysis: iteration table
            //  | # | i        |
            //  | 0 | j-1      |
            //  | 1 | j-2      |
            //  | 2 | j-3      |
            //  ...
            //  | k | j-(k+1) |
            // Stop condition when i = 0, so: j-(k+1) = 0 => k = j-1
        }
        // for loop analysis: summation
        //  $ \sum\limits_{j=2}^{n} c*(j-1) = c*\sum\limits_{j=1}^{n-1}j = c*n(n-1)/2 $
        // So, T(n) = Θ(n^2)
    }

    private static void swap(int[] arr, int i, int j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

}
