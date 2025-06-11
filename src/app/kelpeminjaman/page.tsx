'use client'
import React, { useState } from 'react'

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
  const [itemsPerPage, setItemsPerPage] = useState(3)
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
      namaBarang: 'Item 2',
      kategori: 'Kategori 2',
      supplier: 'Supplier B',
      jumlahBarang: 15
    },
    {
      id: 3,
      kodeBarang: 'SA003',
      namaBarang: 'Item 3',
      kategori: 'Kategori 3',
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="bg-[#0B2447] text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-semibold">Manajemen Kuuota Peminjaman HT</h1>
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-black">Data Peminjaman HT</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
            >
              <span className="mr-2">+</span>
              Tambah
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="mr-2 text-black">Tampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border rounded px-2 py-1 text-black"
              >
                <option value="3">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
              <span className="ml-2 text-black">entri</span>
            </div>
            <div className="flex items-center text-black">
              <span className="mr-2">Pencarian:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-black">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left">NO.</th>
                  <th className="px-6 py-3 text-left">ID Anggota</th>
                  <th className="px-6 py-3 text-left">Nama Barang</th>
                  <th className="px-6 py-3 text-left">Satuan Kerja</th>
                  <th className="px-6 py-3 text-left">Jenis Barang</th>
                  <th className="px-6 py-3 text-left">Qty</th>
                  <th className="px-6 py-3 text-left">Batas Waktu</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white' }>
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item.kodeBarang}</td>
                    <td className="px-6 py-4">{item.namaBarang}</td>
                    <td className="px-6 py-4">{item.kategori}</td>
                    <td className="px-6 py-4">{item.supplier}</td>
                    <td className="px-6 py-4">{item.supplier}</td>
                    <td className="px-6 py-4">{item.jumlahBarang}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2"
                      >
                        <i className="fas fa-edit"></i> Ubah
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md"
                      >
                        <i className="fas fa-trash"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Menampilkan 1 sampai {itemsPerPage} dari {dummyData.length} entri
            </p>
            <div className="flex space-x-2 text-black">
              <button className="px-3 py-1 border rounded-md">Sebelumnya</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
              <button className="px-3 py-1 border rounded-md">Selanjutnya</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 text-black">
            <h2 className="text-xl font-semibold mb-4">Tambah Barang</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kode Barang</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Barang</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah Barang</label>
                <input type="number" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-black">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Barang</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kode Barang</label>
                <input
                  type="text"
                  defaultValue={selectedItem.kodeBarang}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Barang</label>
                <input
                  type="text"
                  defaultValue={selectedItem.namaBarang}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input
                  type="text"
                  defaultValue={selectedItem.kategori}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input
                  type="text"
                  defaultValue={selectedItem.supplier}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah Barang</label>
                <input
                  type="number"
                  defaultValue={selectedItem.jumlahBarang}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-black">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Hapus Barang</h2>
            <p className="mb-4">Apakah Anda yakin ingin menghapus barang ini?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedItem(null)
                }}
                className="px-4 py-2 border rounded-md"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Handle delete
                  setShowDeleteModal(false)
                  setSelectedItem(null)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-4 text-sm text-gray-600">
        Copyright © Sistem Informasi Logistik POLDA NTB 2025
      </footer>
    </div>
  )
}
