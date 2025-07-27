import React from 'react'
import { cn } from '@/lib/utils'
import { Warehouse, Package, Store, MapPin as MapPinIcon } from 'lucide-react'

interface MapPinProps {
  type: 'mfc' | 'inventory' | 'store' | 'route-start' | 'route-end'
  status?: 'stable' | 'overstocked' | 'stockout_risk'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const MapPin = React.forwardRef<HTMLDivElement, MapPinProps>(
  ({ type, status = 'stable', size = 'md', className, children, ...props }, ref) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'overstocked': 
          return 'bg-red-500 border-red-600 shadow-red-500/30'
        case 'stockout_risk': 
          return 'bg-amber-500 border-amber-600 shadow-amber-500/30'
        case 'stable': 
          return 'bg-green-500 border-green-600 shadow-green-500/30'
        default: 
          return 'bg-gray-500 border-gray-600 shadow-gray-500/30'
      }
    }

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'mfc':
          return 'bg-blue-600 border-blue-700 shadow-blue-600/40'
        case 'inventory':
          return 'bg-emerald-600 border-emerald-700 shadow-emerald-600/40'
        case 'store':
          return 'bg-purple-600 border-purple-700 shadow-purple-600/40'
        case 'route-start':
          return 'bg-green-600 border-green-700 shadow-green-600/40'
        case 'route-end':
          return 'bg-red-600 border-red-700 shadow-red-600/40'
        default:
          return 'bg-gray-600 border-gray-700 shadow-gray-600/40'
      }
    }

    const getSizeClasses = (size: string) => {
      switch (size) {
        case 'sm':
          return 'w-6 h-6 text-xs'
        case 'md':
          return 'w-8 h-8 text-sm'
        case 'lg':
          return 'w-12 h-12 text-base'
        default:
          return 'w-8 h-8 text-sm'
      }
    }

    const getIcon = (type: string) => {
      const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16
      
      switch (type) {
        case 'mfc':
          return <Warehouse size={iconSize} className="text-white" />
        case 'inventory':
          return <Package size={iconSize} className="text-white" />
        case 'store':
          return <Store size={iconSize} className="text-white" />
        case 'route-start':
          return <span className="text-white font-bold text-xs">S</span>
        case 'route-end':
          return <span className="text-white font-bold text-xs">E</span>
        default:
          return <MapPinIcon size={iconSize} className="text-white" />
      }
    }

    const colorClass = type === 'route-start' || type === 'route-end' 
      ? getTypeColor(type) 
      : status 
        ? getStatusColor(status) 
        : getTypeColor(type)

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 shadow-lg transform transition-all duration-200 hover:scale-110 cursor-pointer',
          getSizeClasses(size),
          colorClass,
          className
        )}
        {...props}
      >
        {/* Main pin circle */}
        <div className="flex items-center justify-center w-full h-full">
          {children || getIcon(type)}
        </div>
        
        {/* Pin tail/pointer */}
        <div 
          className={cn(
            'absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0',
            'border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent',
            type === 'route-start' || type === 'route-end' 
              ? type === 'route-start' 
                ? 'border-t-green-600' 
                : 'border-t-red-600'
              : status === 'overstocked' 
                ? 'border-t-red-600'
                : status === 'stockout_risk'
                  ? 'border-t-amber-600'
                  : status === 'stable'
                    ? 'border-t-green-600'
                    : type === 'mfc'
                      ? 'border-t-blue-700'
                      : type === 'inventory'
                        ? 'border-t-emerald-700'
                        : 'border-t-purple-700'
          )}
        />
        
        {/* Pulse animation for critical status */}
        {status === 'stockout_risk' && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping',
            'bg-amber-400 opacity-75',
            getSizeClasses(size)
          )} />
        )}
      </div>
    )
  }
)

MapPin.displayName = 'MapPin'

export { MapPin, type MapPinProps }
