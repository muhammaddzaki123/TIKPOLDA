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

interface AddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

interface EditModalProps extends AddModalProps {
  item: Item
}

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  item: Item
}

export function AddModal({ isOpen, onClose, onSubmit }: AddModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tambah Barang</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label>
            <input type="text" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input type="text" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select className="input-field" required>
              <option value="">Pilih Kategori</option>
              <option value="pistol">Pistol</option>
              <option value="rifle">Rifle</option>
              <option value="amunisi">Amunisi</option>
              <option value="perlengkapan">Perlengkapan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input type="text" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Barang</label>
            <input type="number" min="0" className="input-field" required />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function EditModal({ isOpen, onClose, onSubmit, item }: EditModalProps) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Barang</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label>
            <input type="text" className="input-field" defaultValue={item.kodeBarang} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input type="text" className="input-field" defaultValue={item.namaBarang} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select className="input-field" defaultValue={item.kategori} required>
              <option value="">Pilih Kategori</option>
              <option value="pistol">Pistol</option>
              <option value="rifle">Rifle</option>
              <option value="amunisi">Amunisi</option>
              <option value="perlengkapan">Perlengkapan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input type="text" className="input-field" defaultValue={item.supplier} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Barang</label>
            <input
              type="number"
              min="0"
              className="input-field"
              defaultValue={item.jumlahBarang}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DeleteModal({ isOpen, onClose, onConfirm, item }: DeleteModalProps) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hapus Barang</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus barang{' '}
          <span className="font-medium">{item.namaBarang}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
