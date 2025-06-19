import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            AI Betting Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart betting insights powered by artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600">Get personalized betting recommendations based on advanced machine learning algorithms</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-green-600 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Performance Tracking</h3>
            <p className="text-gray-600">Track your bets, analyze patterns, and optimize your betting strategy with detailed analytics</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-purple-600 text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Mobile & Web</h3>
            <p className="text-gray-600">Access your betting dashboard anywhere with our responsive web and mobile applications</p>
          </div>
        </div>

        <div className="space-x-4">
          <Link href="/login">
            <Button size="lg" className="px-8 py-3 text-lg">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Ready to bet smarter? Join thousands of users who trust AI Betting Assistant</p>
        </div>
      </div>
    </div>
  );
}
