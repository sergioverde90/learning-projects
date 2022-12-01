package example.inventory;

import example.inventory.inner.InnerInventoryService;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    
    private final InnerInventoryService inventoryService;

    public InventoryService(InnerInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
}
