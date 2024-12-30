"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PlayCircle, PauseCircle, LayoutGrid } from 'lucide-react'
import debounce from 'lodash/debounce'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdvancedFilter } from "./advanced-filter"
import { OptionsFlow, ViewMode } from "@/types/options-flow"
import { formatPremium, formatStrike, calculateDTE } from "@/lib/utils"

interface FilterValues {
  premiumMin: number | '';
  premiumMax: number | '';
  priceMin: number | '';
  priceMax: number | '';
  sizeMin: number | '';
  sizeMax: number | '';
  ticker: string;
  callPut: "CALL" | "PUT" | "ALL";
}

function passesFilters(data: OptionsFlow, filters: Record<string, any>, tickerFilter: string): boolean {
  // Ticker filter
  if (tickerFilter && data.ticker !== tickerFilter.toUpperCase()) {
    return false;
  }

  // Premium range
  if (filters.totalpremium?.conditions) {
    for (const condition of filters.totalpremium.conditions) {
      const value = parseFloat(condition.filter);
      if (condition.type === 'greaterThan' && data.totalpremium < value) {
        return false;
      }
      if (condition.type === 'lessThan' && data.totalpremium > value) {
        return false;
      }
    }
  }

  // Price range
  if (filters.price?.conditions) {
    for (const condition of filters.price.conditions) {
      const value = parseFloat(condition.filter);
      if (condition.type === 'greaterThan' && data.price < value) {
        return false;
      }
      if (condition.type === 'lessThan' && data.price > value) {
        return false;
      }
    }
  }

  // Size range
  if (filters.size?.conditions) {
    for (const condition of filters.size.conditions) {
      const value = parseFloat(condition.filter);
      if (condition.type === 'greaterThan' && data.size < value) {
        return false;
      }
      if (condition.type === 'lessThan' && data.size > value) {
        return false;
      }
    }
  }

  // Call/Put filter
  if (filters.callput && data.callput !== filters.callput.filter) {
    return false;
  }

  return true;
}

function getColumns(viewMode: ViewMode): ColumnDef<OptionsFlow>[] {
  if (viewMode === 'standard') {
    return [
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
          <div className="font-mono text-gray-400">{row.getValue("time")}</div>
        ),
      },
      {
        accessorKey: "ticker",
        header: "Ticker",
        cell: ({ row }) => (
          <div className="font-mono text-gray-200">{row.getValue("ticker")}</div>
        ),
      },
      {
        accessorKey: "strike",
        header: "Strike",
        cell: ({ row }) => (
          <div className="font-mono text-gray-200">
            {formatStrike(row.original.strike)}
          </div>
        ),
      },
      {
        accessorKey: "expiration",
        header: "Expiration",
        cell: ({ row }) => (
          <div className="font-mono text-gray-200">{row.original.expiration}</div>
        ),
      },
      {
        accessorKey: "dte",
        header: "DTE",
        cell: ({ row }) => (
          <div className="font-mono text-gray-500 text-left">
            {calculateDTE(row.original.expiration)}
          </div>
        ),
      },
      {
        accessorKey: "callput",
        header: "Call/Put",
        cell: ({ row }) => {
          const value = row.getValue("callput") as string
          return (
            <div
              className={`px-4 py-1 text-sm font-medium rounded-full inline-block ${
                value === "CALL"
                  ? "bg-[#132619] text-[#4CAF50]"
                  : "bg-[#291515] text-[#FF5252]"
              }`}
            >
              {value}
            </div>
          )
        },
      },
      {
        accessorKey: "totalpremium",
        header: () => <div className="text-right">Premium ($)</div>,
        cell: ({ row }) => {
          const value = row.original.totalpremium
          const formatted = formatPremium(value)
          return (
            <div className={`font-mono ${value >= 500000 ? "text-[#FFD700]" : "text-gray-300"} text-right`}>
              {formatted}
            </div>
          )
        },
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => (
          <div className="font-mono text-gray-300 text-right">
            {row.getValue("price")}
          </div>
        ),
      },
      {
        accessorKey: "size",
        header: () => <div className="text-right">Size</div>,
        cell: ({ row }) => (
          <div className="font-mono text-gray-300 text-right">
            {row.getValue("size")}
          </div>
        ),
      },
      {
        accessorKey: "is_sweep",
        header: () => <div className="text-center">Type</div>,
        cell: ({ row }) => {
          const value = row.getValue("is_sweep") as string
          const getTypeClass = (type: string) => {
            if (type.includes('SWEEP')) {
              return "bg-[#294680] bg-opacity-30 text-[#87a9ed]"
            }
            if (type.includes('SPLIT')) {
              return "bg-[#b37400] bg-opacity-30 text-[#ffaa2b]"
            }
            if (type.includes('UNUSUAL')) {
              return "bg-[#4b0082] bg-opacity-30 text-[#9370db]"
            }
            return "text-gray-300"
          }

          return value ? (
            <div className="flex justify-center">
              <div className={`font-mono px-4 py-1 rounded-full ${getTypeClass(value)}`}>
                {value}
              </div>
            </div>
          ) : null
        },
      },
    ]
  }

  // Compact view
  return [
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => (
        <div className="font-mono text-gray-400">{row.getValue("time")}</div>
      ),
    },
    {
      accessorKey: "ticker",
      header: "Contract",
      cell: ({ row }) => {
        const data = row.original
        return (
          <div className="font-mono text-gray-200">
            {data.expiration} {data.ticker} {formatStrike(data.strike)}
            <span className={data.callput === "CALL" ? "text-[#62d16f]" : "text-[#f06265]"}>
              {" "}{data.callput === "CALL" ? "C" : "P"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "dte",
      header: "DTE",
      cell: ({ row }) => (
        <div className="font-mono text-gray-500 text-left">
          {calculateDTE(row.original.expiration)}
        </div>
      ),
    },
    {
      accessorKey: "callput",
      header: "C/P",
      cell: ({ row }) => {
        const value = row.getValue("callput") as string
        return (
          <div
            className={`px-4 py-1 text-sm font-medium rounded-full inline-block ${
              value === "CALL"
                ? "bg-[#132619] text-[#4CAF50]"
                : "bg-[#291515] text-[#FF5252]"
            }`}
          >
            {value}
          </div>
        )
      },
    },
    {
      accessorKey: "totalpremium",
      header: () => <div className="text-right">Premium ($)</div>,
      cell: ({ row }) => {
        const value = row.original.totalpremium
        const formatted = formatPremium(value)
        return (
          <div className={`font-mono ${value >= 500000 ? "text-[#FFD700]" : "text-gray-300"} text-right`}>
            {formatted}
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => (
        <div className="font-mono text-gray-300 text-right">
          {row.getValue("price")}
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => (
        <div className="font-mono text-gray-300 text-right">
          {row.getValue("size")}
        </div>
      ),
    },
    {
      accessorKey: "is_sweep",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => {
        const value = row.getValue("is_sweep") as string
        const getTypeClass = (type: string) => {
          if (type.includes('SWEEP')) {
            return "bg-[#294680] bg-opacity-30 text-[#87a9ed]"
          }
          if (type.includes('SPLIT')) {
            return "bg-[#b37400] bg-opacity-30 text-[#ffaa2b]"
          }
          if (type.includes('UNUSUAL')) {
            return "bg-[#4b0082] bg-opacity-30 text-[#9370db]"
          }
          return "text-gray-300"
        }

        return value ? (
          <div className="flex justify-center">
            <div className={`font-mono px-4 py-1 rounded-full ${getTypeClass(value)}`}>
              {value}
            </div>
          </div>
        ) : null
      },
    },
  ]
}

export function OptionsFlowTable() {
  const [data, setData] = React.useState<OptionsFlow[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isLive, setIsLive] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [totalRows, setTotalRows] = React.useState(0)
  const [viewMode, setViewMode] = React.useState<ViewMode>('compact')
  const [wsConnected, setWsConnected] = React.useState(false)
  const pageSize = 100
  const wsRef = React.useRef<WebSocket | null>(null)
  const [tickerFilter, setTickerFilter] = React.useState("")
  const [filters, setFilters] = React.useState<Record<string, any>>({})

  const columns = React.useMemo(() => getColumns(viewMode), [viewMode])

  const fetchPageData = React.useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = {
        startRow: currentPage * pageSize,
        endRow: (currentPage + 1) * pageSize,
        sortModel: sorting.map(sort => ({
          colId: sort.id,
          sort: sort.desc ? 'desc' : 'asc'
        })),
        filterModel: filters
      }

      const response = await fetch('https://api.quantview.net/options_flow_query_nextjs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(queryParams)
      })

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${await response.text()}`)
      }

      const result = await response.json()

      if (Array.isArray(result)) {
        setData(result)
        if (result.length > 0) {
          setTotalRows(prev => Math.max(prev, (currentPage + 1) * pageSize + result.length))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, sorting, filters, pageSize])

  const debouncedFetchData = React.useMemo(
    () => debounce(() => fetchPageData(), 300),
    [fetchPageData]
  )

  React.useEffect(() => {
    debouncedFetchData()
    return () => {
      debouncedFetchData.cancel()
    }
  }, [currentPage, sorting, filters, debouncedFetchData])

  const connectWebSocket = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket('wss://api.quantview.net/ws/')

    ws.onopen = () => {
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      if (!isLive || currentPage !== 0) return;
      
      try {
        const newData = JSON.parse(event.data);
        if (newData.hasOwnProperty('callput')) {
          if (passesFilters(newData, filters, tickerFilter)) {
            setData(prev => [newData, ...prev.slice(0, pageSize - 1)]);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error)
      }
    }

    ws.onclose = () => {
      setWsConnected(false)
    }

    wsRef.current = ws
  }, [isLive, currentPage, pageSize, filters, tickerFilter])

  React.useEffect(() => {
    if (isLive) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
    }
  }, [connectWebSocket, isLive])

  const handlePlayPauseClick = () => {
    const newIsLive = !isLive;
    setIsLive(newIsLive);
    
    if (!newIsLive) {
      // When pausing, first close the connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      // Then update the status
      setWsConnected(false);
    } else {
      // When resuming, attempt to reconnect
      connectWebSocket();
    }
  }

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRows / pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
    manualPagination: true,
  })

  const handleAdvancedFilters = (newFilters: FilterValues) => {
    const filterModel: Record<string, any> = {}

    // Ticker filter
    if (newFilters.ticker) {
      filterModel.ticker = {
        filterType: 'text',
        filter: newFilters.ticker.toUpperCase()
      }
    }

    // Premium range
    if (newFilters.premiumMin !== '' || newFilters.premiumMax !== '') {
      filterModel.totalpremium = {
        conditions: []
      }
      if (newFilters.premiumMin !== '') {
        filterModel.totalpremium.conditions.push({
          type: 'greaterThan',
          filter: newFilters.premiumMin.toString()
        })
      }
      if (newFilters.premiumMax !== '') {
        filterModel.totalpremium.conditions.push({
          type: 'lessThan',
          filter: newFilters.premiumMax.toString()
        })
      }
    }

    // Price range
    if (newFilters.priceMin !== '' || newFilters.priceMax !== '') {
      filterModel.price = {
        conditions: []
      }
      if (newFilters.priceMin !== '') {
        filterModel.price.conditions.push({
          type: 'greaterThan',
          filter: newFilters.priceMin.toString()
        })
      }
      if (newFilters.priceMax !== '') {
        filterModel.price.conditions.push({
          type: 'lessThan',
          filter: newFilters.priceMax.toString()
        })
      }
    }

    // Size range
    if (newFilters.sizeMin !== '' || newFilters.sizeMax !== '') {
      filterModel.size = {
        conditions: []
      }
      if (newFilters.sizeMin !== '') {
        filterModel.size.conditions.push({
          type: 'greaterThan',
          filter: newFilters.sizeMin.toString()
        })
      }
      if (newFilters.sizeMax !== '') {
        filterModel.size.conditions.push({
          type: 'lessThan',
          filter: newFilters.sizeMax.toString()
        })
      }
    }

    // Call/Put filter
    if (newFilters.callPut !== "ALL") {
      filterModel.callput = {
        filter: newFilters.callPut
      }
    }

    setFilters(filterModel)
    setTickerFilter(newFilters.ticker || '')
    setCurrentPage(0)
  }

  return (
    <Card className="w-full bg-[#0c0c0d] border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-blue-500"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-normal text-gray-200">
              Recent Options Flow
            </CardTitle>
            <p className="text-sm text-gray-500">powered by QuantView.net</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter tickers..."
            value={tickerFilter}
            onChange={(event) => {
              const newTickerFilter = event.target.value;
              setTickerFilter(newTickerFilter);
              // Create a complete filter object with default values
              const filterValues: FilterValues = {
                premiumMin: '',
                premiumMax: '',
                priceMin: '',
                priceMax: '',
                sizeMin: '',
                sizeMax: '',
                ticker: newTickerFilter,
                callPut: "ALL"
              };
              handleAdvancedFilters(filterValues);
            }}
            className="max-w-sm bg-[#1c1c1d] border-gray-800 text-gray-300"
          />
          <AdvancedFilter table={table} onApplyFilters={handleAdvancedFilters} />
          <Button
            variant="outline"
            size="icon"
            className="bg-[#1c1c1d] text-gray-300 border-gray-800"
            onClick={handlePlayPauseClick}
          >
            {isLive ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </Button>
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-[#1c1c1d] text-gray-300 border-gray-800">
                <LayoutGrid className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1c1c1d] border-gray-800">
              <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <DropdownMenuRadioItem value="compact" className="text-white">Compact</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="standard" className="text-white">Standard</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md overflow-auto" style={{ height: `${Math.min(data.length * 40 + 47, 600)}px` }}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-800 [&_th]:bg-[#0c0c0d] [&_th]:hover:bg-[#0c0c0d]"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-gray-400 font-medium h-9"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-gray-800 hover:bg-[#1c1c1d]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center text-gray-500"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <div className="text-sm text-gray-500">
            {data.length > 0 
              ? `Showing ${currentPage * pageSize + 1} to ${Math.min((currentPage + 1) * pageSize, totalRows)} of ${totalRows} entries`
              : 'No entries to show'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
              className="bg-[#1c1c1d] text-gray-300 border-gray-800"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
              className="bg-[#1c1c1d] text-gray-300 border-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

