import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatCategoryLabel } from "../lib/categoryLabels";

const ProductListingCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    className="group overflow-hidden rounded-[1.75rem] bg-white shadow-lg ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="relative">
      <img src={product.images?.[0]} alt={product.name} className="h-56 w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/80 via-indigo-950/10 to-transparent px-4 pb-4 pt-10">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900">{product.status}</span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            {formatCategoryLabel(product.category)}
          </span>
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-xl font-bold text-gray-800">{product.name}</h3>
        <div className="shrink-0 rounded-2xl bg-indigo-50 px-3 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Price</p>
          <p className="text-lg font-bold text-indigo-700">LKR {product.price}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-indigo-700">
        <span>View full details</span>
        <ArrowRight size={18} />
      </div>
    </div>
  </Link>
);

export default ProductListingCard;
