import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCart';

describe('useCartStore', () => {
  // Reset state before each test
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add a new item to an empty cart', () => {
    const item = { id: 'item-1', name: 'Burger', price: 10, quantity: 1 };
    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(item);
    expect(state.totalItems()).toBe(1);
    expect(state.totalPrice()).toBe(10);
  });

  it('should increment quantity for an existing item', () => {
    const item = { id: 'item-1', name: 'Burger', price: 10, quantity: 1 };
    
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item); // Add same item again

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalItems()).toBe(2);
    expect(state.totalPrice()).toBe(20);
  });

  it('should update quantity for an existing item', () => {
    const item = { id: 'item-1', name: 'Burger', price: 10, quantity: 1 };
    useCartStore.getState().addItem(item);
    
    useCartStore.getState().updateQuantity('item-1', 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalItems()).toBe(5);
    expect(state.totalPrice()).toBe(50);
  });

  it('should remove an item from the cart', () => {
    const item1 = { id: 'item-1', name: 'Burger', price: 10, quantity: 1 };
    const item2 = { id: 'item-2', name: 'Fries', price: 5, quantity: 1 };
    
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    
    useCartStore.getState().removeItem('item-1');

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('item-2');
  });

  it('should clear the cart completely', () => {
    const item1 = { id: 'item-1', name: 'Burger', price: 10, quantity: 1 };
    const item2 = { id: 'item-2', name: 'Fries', price: 5, quantity: 1 };
    
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems()).toBe(0);
    expect(state.totalPrice()).toBe(0);
  });
});
