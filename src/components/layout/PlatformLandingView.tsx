import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PlatformLandingView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl space-y-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome to <span className="text-indigo-600">Kwickly</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The all-in-one ordering and subscription platform for modern restaurants. Please visit your restaurant's specific URL or scan their table QR code to place an order.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="http://swamy.localhost:3000" className="w-full sm:w-auto">
            <Button size="lg" className="w-full font-semibold">
              Visit Demo Restaurant
            </Button>
          </Link>
          <Link href="/auth" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full font-semibold">
              Customer Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
