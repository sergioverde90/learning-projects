let array = [-2, -5, 6, -2, -3, 1, 5, -6];

// using the divide-and-conquer approach -> Θ(n log(n));
function maximum_subarray(A, low, high) {

    if (low == high) {
        return {"sum": A[low], "low": low, "high": high} // base case, a single element
    }

    let mid = Math.floor((low + high) / 2);

    var left = maximum_subarray(A, low, mid);               // Θ(n/2)
    var right = maximum_subarray(A, mid + 1, high);         // Θ(n/2)
    var cross = max_crossing_subarray(A, low, mid, high);   // Θ(n)

    if (left.sum >= right.sum && left.sum >= cross.sum) {
        return { "sum": left.sum, "low": left.low, "high": left.high };
    } else if (right.sum >= left.sum && right.sum >= cross.sum) {
        return { "sum": right.sum, "low": right.low, "high": right.high };
    } else {
        return { "sum": cross.sum, "low": cross.low, "high": cross.high };
    }

}

function max_crossing_subarray(A, low, mid, high) {
    // from mid to low
    let leftSum = undefined;
    let leftIndex = 0;
    let sum = 0;
    for (let i = mid; i > low; i--) {
        sum += A[i];
        if (leftSum === undefined || sum > leftSum) {
            leftSum = sum;
            leftIndex = i;
        }
    } 

    // from mid to max_i
    let rightSum = undefined;
    let rightIndex = 0;
    sum = 0;
    for (let i = mid + 1; i < high; i++) {
        sum += A[i];
        if (rightSum === undefined || sum > rightSum) {
            rightSum = sum;
            rightIndex = i;
        }
    } 

    return {
        "low" : leftIndex, 
        "high" : rightIndex, 
        "sum" : (leftSum + rightSum)
    };
}

var result = maximum_subarray(array, 0, array.length);

console.log(result);