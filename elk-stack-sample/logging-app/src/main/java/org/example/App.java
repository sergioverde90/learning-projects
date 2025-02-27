package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class App {

    private static final Logger logger = LoggerFactory.getLogger(App.class);
    
    public static void main( String[] args ) throws InterruptedException {
        int[][] sets = init();
        boolean disjoint = true;
        
        for (int i = 0; i < sets.length; i++) {
            int[] current_set_i = sets[i];
            
            for (int j = i + 1; j < sets.length; j++) {
                int[] current_set_j = sets[j];
                for (int k = 0; k < current_set_i.length; k++) {
                    for (int l = 0; l < current_set_j.length; l++) {
                        int current_i = current_set_i[k];
                        int current_j = current_set_j[l];
                        if (current_i == current_j) {
                            disjoint = false;
                        }
                    }
                }
            }
        }

        System.out.println("disjoint = " + disjoint);
    }

    private static int[][] init() {
        return new int[][]{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    }

}
