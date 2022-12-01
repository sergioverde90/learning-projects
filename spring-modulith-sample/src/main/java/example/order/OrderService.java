package example.order;

import example.inventory.InventoryService;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    
    private final InventoryService inventoryService;

    public OrderService(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
}
