public class InsertionSort {

    public static void main(String[] args) {
        final int[] arr = {9,5,2,3,8,4,1,6,7};
        insertionsort(arr);

        System.out.println("arr = " + Arrays.stream(arr).boxed().toList());
    }
    
    private static void insertionsort(int[] arr) {
        for (int j = 1; j < arr.length; j++) { // runtime analysis -> https://blog.ssvv.dev/blog/algorithms-analysis/
            int i = j - 1;
            while (i >= 0 && arr[i] > arr[i+1]) { 
                swap(arr, i, i+1);
                i--;
            }
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

}
