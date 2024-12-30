"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { SlidersHorizontal } from 'lucide-react'
import { parseFormattedNumber } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterValues {
  premiumMin: number | string
  premiumMax: number | string
  priceMin: number | string
  priceMax: number | string
  sizeMin: number | string
  sizeMax: number | string
  ticker: string
  callPut: "CALL" | "PUT" | "ALL"
}

interface AdvancedFilterProps<TData> {
  table: Table<TData>
  onApplyFilters: (filters: FilterValues) => void
}

export function AdvancedFilter<TData>({ table, onApplyFilters }: AdvancedFilterProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<FilterValues>({
    premiumMin: '',
    premiumMax: '',
    priceMin: '',
    priceMax: '',
    sizeMin: '',
    sizeMax: '',
    ticker: "",
    callPut: "ALL",
  })

  const handleNumberInput = (value: string, field: keyof FilterValues) => {
    try {
      const numericValue = parseFormattedNumber(value)
      setFilters(prev => ({ ...prev, [field]: numericValue }))
    } catch (error) {
      console.error(`Error parsing ${field} value:`, error)
    }
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-[#1c1c1d] text-gray-300 border-gray-800"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1c1c1d] text-gray-200 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Options Flow Filter</DialogTitle>
          <DialogDescription className="text-gray-400">
            Filter incoming options flow to fit specific conditions
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex gap-4">
            <div className="space-y-1 flex-1">
              <Label>Ticker</Label>
              <Input
                placeholder="Enter ticker..."
                value={filters.ticker}
                onChange={(e) => setFilters(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8"
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label>Call/Put</Label>
              <Select
                value={filters.callPut}
                onValueChange={(value: "CALL" | "PUT" | "ALL") => setFilters(prev => ({ ...prev, callPut: value }))}
              >
                <SelectTrigger className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1d] border-gray-800 text-white">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="PUT">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Premium Range ($)</Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  placeholder="25k"
                  value={filters.premiumMin === '' ? '' : filters.premiumMin.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'premiumMin')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  placeholder="10B"
                  value={filters.premiumMax === '' ? '' : filters.premiumMax.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'premiumMax')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Price Range ($)</Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  placeholder="0.01"
                  value={filters.priceMin === '' ? '' : filters.priceMin.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'priceMin')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  placeholder="100k"
                  value={filters.priceMax === '' ? '' : filters.priceMax.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'priceMax')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Size Range</Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  placeholder="1"
                  value={filters.sizeMin === '' ? '' : filters.sizeMin.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'sizeMin')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  placeholder="1M"
                  value={filters.sizeMax === '' ? '' : filters.sizeMax.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, 'sizeMax')}
                  className="bg-[#0c0c0d] border-gray-800 text-gray-200 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

