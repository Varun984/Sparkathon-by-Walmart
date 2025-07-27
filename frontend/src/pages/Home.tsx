import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, LogIn } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
        <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Glyphor</h1>
        <div>
          <SignedIn>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://www.reuters.com/resizer/v2/HFE7GTJC2FOLVHH3JDYHESVMAI.jpg?auth=9f3997ad90be9599a7ceef66c2d9e2fa8371ae6183f2e166074b920db8f57b3a&width=1080&quality=80')`
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-2">
          <span className="text-2xl md:text-3xl font-bold text-white">
            <i>Glyphor</i>
          </span>
          <span className="text-xs text-yellow-400 font-medium">for</span>
          <span className="text-2xl md:text-3xl font-bold text-blue-600">
            Walmart
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-40 flex min-h-[calc(100vh-120px)] items-center">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Card with Dynamic Blur Background */}
            <div className="relative">
              {/* Dynamic blur area behind card only */}
              <div className="absolute inset-0 -m-8 bg-black/40 backdrop-blur-xl rounded-3xl" />
              
              {/* Card Content */}
              <Card className="relative bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                      <Zap className="w-3 h-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Dynamic Inventory
                    <span className="text-blue-600 block">Redistribution</span>
                  </CardTitle>
                  
                  <CardDescription className="text-lg text-gray-600">
                    Eliminate stockouts and overstocking with our AI-powered system that predicts demand spikes and triggers real-time inventory reallocation. Transform your supply chain with intelligent automation that optimizes inventory across all fulfillment centers.
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pt-6">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Access Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Clear background image */}
            <div className="hidden lg:block">
              {/* This space intentionally left empty to show clear background */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
