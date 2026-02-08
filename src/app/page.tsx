'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Menu as MenuIcon, Search, Clipboard, Store, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/contexts/NavigationContext'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { ImageCarousel } from "@/components/ImageCarousel"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string
  category: string
  available: boolean
}

export default function Home() {
  const { view, setView } = useNavigation()
  const { logout: adminLogout } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { items, addToCart, updateQuantity, removeFromCart, getTotalPrice } = useCartStore()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = selectedCategory === 'all'
    ? products.filter(p => p.available)
    : products.filter(p => p.category === selectedCategory && p.available)

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
  }

  const CheckoutForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      address: '',
      paymentMethod: 'cash'
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: formData.name,
            customerPhone: formData.phone,
            customerAddress: formData.address,
            paymentMethod: formData.paymentMethod,
            items
          })
        })

        const data = await response.json()

        if (data.success) {
          window.location.href = data.whatsappUrl
        } else {
          alert(data.error)
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Failed to process order')
      } finally {
        setLoading(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">WhatsApp Number *</label>
          <input
            type="tel"
            required
            placeholder="628123456789"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Address *</label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method *</label>
          <select
            required
            className="w-full px-3 py-2 border rounded-md"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="transfer">Bank Transfer</option>
            <option value="ewallet">E-Wallet (GoPay, OVO, Dana)</option>
          </select>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total</span>
            <span>Rp{getTotalPrice().toLocaleString()}</span>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Order via WhatsApp'}
          </Button>
        </div>
      </form>
    )
  }

  const AdminPanel = () => {
    const { logout: adminLogout } = useAdminAuth()
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Main Course',
      available: true
    })
    const [loading, setLoading] = useState(false)
    const [seeding, setSeeding] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price)
          })
        })

        if (response.ok) {
          await fetchProducts()
          setFormData({
            name: '',
            description: '',
            price: '',
            image: '',
            category: 'Main Course',
            available: true
          })
          alert('Product added successfully!')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Failed to add product')
      } finally {
        setLoading(false)
      }
    }

    const handleSeed = async () => {
      if (!confirm('This will add sample products to the database. Continue?')) return
      setSeeding(true)
      try {
        const response = await fetch('/api/seed', {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          await fetchProducts()
          alert(`Successfully seeded ${data.count} products!`)
        } else {
          alert(data.message || 'Failed to seed database')
        }
      } catch (error) {
        console.error('Error seeding:', error)
        alert('Failed to seed database')
      } finally {
        setSeeding(false)
      }
    }

    const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this product?')) return

      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchProducts()
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Failed to delete product')
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleSeed}
            disabled={seeding}
            variant="outline"
            className="flex-1"
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
          <Button
            onClick={adminLogout}
            variant="destructive"
            className="flex-1"
          >
            Logout
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (Rp) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Manage Products</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">Rp{product.price.toLocaleString()}</p>
                  </div>
                  <Badge variant={product.available ? "default" : "secondary"}>
                    {product.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const SearchView = () => {
    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {searchQuery && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.filter(p => p.available).map((product) => {
              const cartItem = items.find(item => item.id === product.id)
              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-green-600 font-bold mt-2">
                      Rp{product.price.toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {cartItem ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          className="flex-1 h-7 border rounded hover:bg-muted"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          className="flex-1 h-7 border rounded hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const OrdersView = () => {
    const mockOrders = [
      { id: 'ORD001', date: '2024-01-15', status: 'Delivered', total: 45000 },
      { id: 'ORD002', date: '2024-01-14', status: 'Delivered', total: 62000 },
      { id: 'ORD003', date: '2024-01-13', status: 'Cancelled', total: 28000 },
    ]

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">My Orders</h2>
        {mockOrders.length === 0 ? (
          <div className="text-center py-12">
            <Clipboard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <Badge
                      variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold text-green-600">Rp{order.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const StoreInfoView = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">FoodOrder</h2>
                <p className="text-sm text-muted-foreground">Delicious Indonesian Cuisine</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About Us
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  We serve authentic Indonesian dishes made with fresh ingredients and traditional recipes.
                  Order directly and enjoy your favorite meals!
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>10:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span>09:00 - 23:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📱 WhatsApp: 6281234567890</p>
                  <p>📍 Address: 123 Food Street, Jakarta</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">Cash</Badge>
              <Badge variant="outline" className="text-sm">Bank Transfer</Badge>
              <Badge variant="outline" className="text-sm">GoPay</Badge>
              <Badge variant="outline" className="text-sm">OVO</Badge>
              <Badge variant="outline" className="text-sm">Dana</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {view === 'products' && (
          <>

            {/* Image Carousel */}
            <div className="mb-6">
              <ImageCarousel />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-32 bg-muted" />
                    <CardContent className="pt-4">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <MenuIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => {
                  const cartItem = items.find(item => item.id === product.id)
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-green-600">
                          {product.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                        <p className="text-green-600 font-bold mt-2">
                          Rp{product.price.toLocaleString()}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {cartItem ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                              className="flex-1 h-7 border rounded hover:bg-muted"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                              className="flex-1 h-7 border rounded hover:bg-muted"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {view === 'search' && (
          <SearchView />
        )}

        {view === 'orders' && (
          <OrdersView />
        )}

        {view === 'storeInfo' && (
          <StoreInfoView />
        )}

        {view === 'checkout' && (
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => setView('products')}
              className="mb-4"
            >
              ← Back to Products
            </Button>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Checkout</h2>
                <CheckoutForm />
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setView('products')}
              className="mb-4"
            >
              ← Back to Products
            </Button>
            <AdminPanel />
          </div>
        )}
      </div>
    </>
  )
}
