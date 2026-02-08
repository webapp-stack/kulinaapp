'use client'

import { useState } from 'react'
import { useNavigation } from '@/contexts/NavigationContext'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useCartStore } from '@/store/cart'
import { ShoppingCart, Menu as MenuIcon, Search, Clipboard, Store, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function BottomNavigation() {
  const { view, setView } = useNavigation()
  const { isAuthenticated, login, logout, showLoginModal, setShowLoginModal } = useAdminAuth()
  const { items, getTotalItems } = useCartStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setView('admin')
    } else {
      setPassword('')
      setError('')
      setShowLoginModal(true)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!login(password)) {
      setError('Incorrect password')
    }
  }

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
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setView('products')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              view === 'products' ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>

          <button
            onClick={() => setView('search')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              view === 'search' ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center w-full relative">
                <div className="relative">
                  <ShoppingCart className={`h-5 w-5 ${
                    items.length > 0 ? 'text-green-600' : 'text-muted-foreground'
                  }`} />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1">Cart</span>
              </button>
            </SheetTrigger>
            <SheetContent className="w-full">
              <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
              <CartContent />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setView('orders')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              view === 'orders' ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <Clipboard className="h-5 w-5" />
            <span className="text-xs mt-1">Orders</span>
          </button>

          <button
            onClick={() => setView('storeInfo')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              view === 'storeInfo' ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <Store className="h-5 w-5" />
            <span className="text-xs mt-1">Store</span>
          </button>

          <button
            onClick={handleAdminClick}
            className={`flex flex-col items-center justify-center w-full h-full ${
              view === 'admin' ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Admin</span>
          </button>
        </div>
      </nav>

      {/* Admin Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter the admin password to access the dashboard.
              <br />
              <span className="text-sm text-muted-foreground">Default password: <strong className="text-green-600">Admin123</strong></span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Login
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              <button
                onClick={() => {
                  alert('Forgot Password? Please contact the developer to reset your access.\n\nWhatsApp: wa.me/6281234567890')
                  setShowLoginModal(false)
                }}
                className="text-green-600 hover:underline"
              >
                Forgot Password?
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
