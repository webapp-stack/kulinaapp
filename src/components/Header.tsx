'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import { useCartStore } from '@/store/cart'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Home, ShoppingCart, Clipboard, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  const { view, setView } = useNavigation()
  const { items, getTotalItems } = useCartStore()
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAdminAuth()

  const CartContent = () => {
    const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore()

    return (
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Rp{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 p-0 flex items-center justify-center border rounded hover:bg-muted"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 p-0 flex items-center justify-center border rounded hover:bg-muted"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 flex items-center justify-center text-red-500 hover:text-red-700 ml-auto"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>Rp{getTotalPrice().toLocaleString()}</span>
              </div>
              <button
                onClick={() => setView('checkout')}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b z-50 hidden md:block">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">FoodOrder</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Button
              variant={view === 'products' ? 'default' : 'ghost'}
              onClick={() => setView('products')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant={view === 'checkout' || items.length > 0 ? 'default' : 'ghost'} className="gap-2 relative">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {getTotalItems() > 0 && (
                    <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px]">
                <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
                <CartContent />
              </SheetContent>
            </Sheet>

            <Button
              variant={view === 'orders' ? 'default' : 'ghost'}
              onClick={() => setView('orders')}
              className="gap-2"
            >
              <Clipboard className="h-4 w-4" />
              My Orders
            </Button>

            <Button
              variant={view === 'admin' ? 'default' : 'ghost'}
              onClick={() => isAuthenticated ? setView('admin') : setShowLoginModal(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
