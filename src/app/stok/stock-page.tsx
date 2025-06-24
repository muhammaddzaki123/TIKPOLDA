'use client'
import React, { useState } from 'react'
import Layout from '@/components/Layout'
import StockTable from '@/components/StockTable'
import { AddModal, EditModal, DeleteModal } from '@/components/StockModals'

interface Item {
  id: number
  kodeBarang: string
  namaBarang: string
  kategori: string
  supplier: string
  jumlahBarang: number
}

export default function StokBarang() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const dummyData: Item[] = [
    {
      id: 1,
      kodeBarang: 'SA001',
      namaBarang: 'SVI Infinity',
      kategori: 'Pistol',
      supplier: 'Supplier A',
      jumlahBarang: 10
    },
    {
      id: 2,
      kodeBarang: 'SA002',
      namaBarang: 'Glock 17',
      kategori: 'Pistol',
      supplier: 'Supplier B',
      jumlahBarang: 15
    },
    {
      id: 3,
      kodeBarang: 'SA003',
      namaBarang: 'M4 Carbine',
      kategori: 'Rifle',
      supplier: 'Supplier C',
      jumlahBarang: 20
    }
  ]

  const handleEdit = (item: Item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleDelete = (item: Item) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle add logic here
    setShowAddModal(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle edit logic here
    setShowEditModal(false)
    setSelectedItem(null)
  }

  const handleDeleteConfirm = () => {
    // Handle delete logic here
    setShowDeleteModal(false)
    setSelectedItem(null)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok Barang</h1>
            <p className="text-gray-500">Kelola inventaris dan stok barang</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Tambah Barang</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="input-field !py-1 !px-2 w-20"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="text-sm text-gray-600">entri</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <select className="input-field !py-1 !px-2 w-32">
                  <option value="">Semua Kategori</option>
                  <option value="pistol">Pistol</option>
                  <option value="rifle">Rifle</option>
                  <option value="amunisi">Amunisi</option>
                  <option value="perlengkapan">Perlengkapan</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari barang..."
                className="input-field pl-10"
              />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>

        {/* Table */}
        <StockTable data={dummyData} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">1</span> sampai{' '}
            <span className="font-medium">{itemsPerPage}</span> dari{' '}
            <span className="font-medium">{dummyData.length}</span> data
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1 !px-3" disabled>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="btn-primary !py-1 !px-3">1</button>
            <button className="btn-secondary !py-1 !px-3">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Modals */}
        <AddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddSubmit} />
        
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
          onSubmit={handleEditSubmit}
          item={selectedItem as Item}
        />

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedItem(null)
          }}
          onConfirm={handleDeleteConfirm}
          item={selectedItem as Item}
        />
      </div>
    </Layout>
  )
}
