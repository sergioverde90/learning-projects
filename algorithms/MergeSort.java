public class MergeSort {

    public static void main(String[] args) {
        final int[] arr = {9,5,2,3,8,4,1,6,7};
        mergesort(arr, 0, arr.length - 1);

        System.out.println("arr = " + Arrays.stream(arr).boxed().toList());
    }

    private static void mergesort(int[] arr, int from, int to) {
        if (from == to) return;
        
        // divide
        int mid = (from + to) / 2;
        mergesort(arr, from, mid);      // T(n) = T(n/2)
        mergesort(arr, mid + 1, to);    // T(n) = T(n/2)  
        
        // conquer
        merge(arr, from, to);           // Θ(n) -> c*n
        
        // So, ignoring constants: 
        //   T(n) = 2T(n/2) + Θ(n) => Θ(n log(n))
    }

    private static void merge(int[] arr, int from, int to) {
        int mid = (int) Math.floor((float) (from + to) / 2) + 1;
        final int[] left = Arrays.copyOfRange(arr, from, mid);
        final int[] right = Arrays.copyOfRange(arr, mid, to + 1); // because range = [from, to)
        
        // two pointer approach
        int i = 0, j = 0, k = from;
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) { // []
                arr[k] = left[i];
                i++;
            } else {
                arr[k] = right[j];
                j++;
            }
            k++;
        }
        
        // at this point the remaining array is sorted up to the end of left or right.
        // the remaining content has to be appended
        if (i < left.length) {
            // then the right 'hand' was completed, fill it with the left content
            while(i < left.length) {
                arr[k] = left[i];
                i++;
                k++;
            }
        } else {
            // then the left 'hand' was completed, fill it with the right content
            while(j < right.length) {
                arr[k] = right[j];
                j++;
                k++;
            }
        }
    }

}
