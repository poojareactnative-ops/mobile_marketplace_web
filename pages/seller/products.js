"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import InputField from "../../components/InputField";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  ChevronDown,
  Star,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const STORAGE_KEY = "seller_products_v1";

function emptyProduct() {
  return {
    id: "",
    name: "",
    brand: "",
    sku: "",
    modelCompatibility: "",
    condition: "New",
    warranty: "",
    images: [],
    seller: "",
    distance: "",
    oldPrice: "",
    discount: 0,
    rating: 0,
    reviews: 0,
    price: "",
    stock: 0,
    category: "",
    features: "",
    tags: "",
    description: "",
  };
}

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setProducts(raw ? JSON.parse(raw) : []);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {}
  }, [products]);

  const categories = useMemo(() => {
    const unique = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.brand?.toLowerCase().includes(searchText) ||
        product.sku?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && Number(product.stock) > 5) ||
        (stockFilter === "Low Stock" &&
          Number(product.stock) > 0 &&
          Number(product.stock) <= 5) ||
        (stockFilter === "Out of Stock" && Number(product.stock) === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const stats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock) > 5
    ).length;

    const lowStock = products.filter(
      (product) =>
        Number(product.stock) > 0 && Number(product.stock) <= 5
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock) === 0
    ).length;

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  function openNew() {
    setForm(emptyProduct());
    setEditing(null);
    setIsModalOpen(true);
  }

  function openEdit(product) {
    setForm(product);
    setEditing(product.id);
    setIsModalOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;

    if (editing) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editing ? { ...form } : item
        )
      );
    } else {
      const id = `p_${Date.now()}`;

      setProducts((prev) => [
        {
          ...form,
          id,
        },
        ...prev,
      ]);
    }

    setIsModalOpen(false);
  }

  function remove(id) {
    if (!confirm("Delete this product?")) return;

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  function handleFiles(event) {
    const files = event.target.files;

    if (!files) return;

    Array.from(files).forEach((file) => {
      readFileAsDataURL(file)
        .then((dataUrl) => {
          setForm((current) => ({
            ...current,
            images: [
              ...(current.images || []),
              dataUrl,
            ],
          }));
        })
        .catch(() => {});
    });

    event.target.value = "";
  }

  function removeImage(index) {
    setForm((current) => ({
      ...current,
      images: current.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  }

  function stockStatus(stock) {
    const value = Number(stock);

    if (value === 0) {
      return {
        label: "Out of stock",
        className:
          "bg-red-50 text-red-600 ring-red-100",
      };
    }

    if (value <= 5) {
      return {
        label: "Low stock",
        className:
          "bg-amber-50 text-amber-600 ring-amber-100",
      };
    }

    return {
      label: "In stock",
      className:
        "bg-emerald-50 text-emerald-600 ring-emerald-100",
    };
  }

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-6 pb-10">

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 shadow-xl shadow-indigo-100 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <ShoppingBag className="h-3.5 w-3.5" />
                Seller Inventory
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                Create, organize and manage your mobile accessories
                inventory from one place.
              </p>
            </div>

            <button
              onClick={openNew}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add Product
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

          <StatCard
            title="Total Products"
            value={stats.total}
            icon={Package}
            description="All products"
          />

          <StatCard
            title="In Stock"
            value={stats.inStock}
            icon={Boxes}
            description="Healthy inventory"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
            description="Needs attention"
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={TrendingUp}
            description="Restock required"
            iconClass="bg-red-50 text-red-600"
          />

        </div>

        {/* FILTER BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product, brand, SKU..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* CATEGORY */}
            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories}
            />

            {/* STOCK */}
            <FilterSelect
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                "All",
                "In Stock",
                "Low Stock",
                "Out of Stock",
              ]}
            />

          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {products.length}
              </span>{" "}
              products
            </p>

            {(search ||
              categoryFilter !== "All" ||
              stockFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                  setStockFilter("All");
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Product Inventory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage pricing, stock and product details.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <EmptyTable />
                ) : (
                  filteredProducts.map((product) => {
                    const status = stockStatus(product.stock);

                    return (
                      <tr
                        key={product.id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        {/* PRODUCT */}
                        <td className="px-5 py-5">
                          <div className="flex min-w-[260px] items-center gap-3">

                            <ProductImage
                              product={product}
                            />

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {product.brand
                                  ? `${product.brand} · `
                                  : ""}
                                SKU: {product.sku || product.id}
                              </p>

                              {product.modelCompatibility && (
                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                  Compatible:{" "}
                                  {product.modelCompatibility}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {product.category || "Uncategorized"}
                          </span>

                          <p className="mt-2 text-xs text-slate-400">
                            {product.condition}
                          </p>
                        </td>

                        {/* PRICE */}
                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900">
                            {product.price
                              ? `₹${product.price}`
                              : "—"}
                          </p>

                          {product.oldPrice && (
                            <p className="mt-1 text-xs text-slate-400 line-through">
                              ₹{product.oldPrice}
                            </p>
                          )}

                          {product.discount > 0 && (
                            <span className="mt-1 inline-block text-[11px] font-semibold text-emerald-600">
                              {product.discount}% OFF
                            </span>
                          )}
                        </td>

                        {/* STOCK */}
                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-800">
                            {product.stock}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* RATING */}
                        <td className="px-5 py-5">
                          {product.rating > 0 ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold text-slate-700">
                                  {product.rating}
                                </span>
                              </div>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {product.reviews || 0} reviews
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No ratings
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2 opacity-80 transition group-hover:opacity-100">
                            <button
                              onClick={() => openEdit(product)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => remove(product.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="space-y-3 lg:hidden">

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Package className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No products found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first product to get started.
              </p>

              <button
                onClick={openNew}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const status = stockStatus(product.stock);

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <ProductImage product={product} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-900">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {product.brand || "No brand"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {product.price
                              ? `₹${product.price}`
                              : "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {product.stock} units available
                          </p>
                        </div>

                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {product.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {product.category || "Uncategorized"}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => remove(product.id)}
                        className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">

            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="relative z-10 flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Inventory
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {editing
                      ? "Edit Product"
                      : "Add New Product"}
                  </h2>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="overflow-y-auto p-5 sm:p-6">

                {/* BASIC INFO */}
                <FormSection
                  icon={Package}
                  title="Basic Information"
                  description="Enter the main product details."
                >
                  <InputField
                    label="Product name"
                    name="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Fast Charging USB-C Cable"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Brand"
                      name="brand"
                      value={form.brand}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          brand: e.target.value,
                        }))
                      }
                      placeholder="Brand name"
                    />

                    <InputField
                      label="SKU / ID"
                      name="sku"
                      value={form.sku}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          sku: e.target.value,
                        }))
                      }
                      placeholder="SKU-001"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Category"
                      name="category"
                      value={form.category}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          category: e.target.value,
                        }))
                      }
                      placeholder="Chargers, cables, audio..."
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Condition
                      </label>

                      <select
                        value={form.condition}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            condition: e.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      >
                        <option>New</option>
                        <option>Refurbished</option>
                        <option>Used</option>
                      </select>
                    </div>
                  </div>
                </FormSection>

                {/* PRICING */}
                <FormSection
                  icon={TrendingUp}
                  title="Pricing & Inventory"
                  description="Set your pricing and available stock."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InputField
                      label="Selling price"
                      name="price"
                      value={form.price}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          price: e.target.value,
                        }))
                      }
                      placeholder="₹999"
                    />

                    <InputField
                      label="Old price"
                      name="oldPrice"
                      value={form.oldPrice}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          oldPrice: e.target.value,
                        }))
                      }
                      placeholder="₹1,299"
                    />

                    <InputField
                      label="Stock"
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          stock: Number(e.target.value),
                        }))
                      }
                      placeholder="100"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Discount (%)"
                      name="discount"
                      type="number"
                      value={form.discount}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          discount: Number(e.target.value),
                        }))
                      }
                      placeholder="10"
                    />

                    <InputField
                      label="Warranty"
                      name="warranty"
                      value={form.warranty}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          warranty: e.target.value,
                        }))
                      }
                      placeholder="6 months"
                    />
                  </div>
                </FormSection>

                {/* COMPATIBILITY */}
                <FormSection
                  icon={ShieldCheck}
                  title="Product Details"
                  description="Add compatibility and seller information."
                >
                  <InputField
                    label="Model compatibility"
                    name="modelCompatibility"
                    value={form.modelCompatibility}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        modelCompatibility: e.target.value,
                      }))
                    }
                    placeholder="iPhone 15, Samsung S24..."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Seller name"
                      name="seller"
                      value={form.seller}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          seller: e.target.value,
                        }))
                      }
                      placeholder="Your shop name"
                    />

                    <InputField
                      label="Distance"
                      name="distance"
                      value={form.distance}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          distance: e.target.value,
                        }))
                      }
                      placeholder="1.2 km"
                    />
                  </div>

                  <InputField
                    label="Tags"
                    name="tags"
                    value={form.tags}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="fast-charging, usb-c, premium"
                  />
                </FormSection>

                {/* IMAGES */}
                <FormSection
                  icon={ImagePlus}
                  title="Product Images"
                  description="Upload multiple images for your product."
                >
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                      <ImagePlus className="h-6 w-6" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      Click to upload product images
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      PNG, JPG or WEBP
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFiles}
                      className="hidden"
                    />
                  </label>

                  {form.images?.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                      {form.images.map((url, index) => (
                        <div
                          key={index}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-red-500 opacity-0 shadow-sm transition group-hover:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>

                {/* DESCRIPTION */}
                <FormSection
                  icon={ShoppingBag}
                  title="Description"
                  description="Help customers understand the product."
                >
                  <textarea
                    value={form.features}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        features: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Key features, one per line..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Write a short product description..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </FormSection>

              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={save}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300"
                >
                  {editing ? "Update Product" : "Save Product"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass = "bg-indigo-50 text-indigo-600",
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="hidden rounded-lg bg-slate-50 p-1.5 text-slate-300 transition group-hover:text-indigo-400 sm:block">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function ProductImage({ product }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-500 ring-1 ring-indigo-100">
      {product.images?.length > 0 ? (
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package className="h-5 w-5" />
      )}
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

function TableHead({ children, align }) {
  return (
    <th
      className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function EmptyTable() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <Package className="h-7 w-7" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No products found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your search or filters, or add your
            first product.
          </p>
        </div>
      </td>
    </tr>
  );
}