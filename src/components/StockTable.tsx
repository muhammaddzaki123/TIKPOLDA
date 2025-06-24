'use client'
import React from 'react'

interface Item {
  id: number
  kodeBarang: string
  namaBarang: string
  kategori: string
  supplier: string
  jumlahBarang: number
}

interface StockTableProps {
  data: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

export default function StockTable({ data, onEdit, onDelete }: StockTableProps) {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kode Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kodeBarang}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.namaBarang}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kategori}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.supplier}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.jumlahBarang}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => onEdit(item)} className="text-yellow-600 hover:text-yellow-900">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
