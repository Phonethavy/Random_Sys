import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { uploadParticipants } from '../api'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const response = await uploadParticipants(file)
      let message = `ອັບໂຫຼດສໍາເລັດ! `;
      if (response.inserted > 0) {
        message += `ເພີ່ມໃໝມ່ ${response.inserted} ລາຍການ`;
      }
      if (response.skipped > 0) {
        message += response.inserted > 0 ? `, ຂ້າມ ${response.skipped} ລາຍການທີ່ມີຢູ່ແລ້ວ` : `ຂ້າມ ${response.skipped} ລາຍການທີ່ມີຢູ່ແລ້ວ`;
      }
      setResult({
        success: true,
        message: message,
        details: response,
      })
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດ',
        details: error.response?.data,
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a sample Excel template
    const template = `employee_name,employee_id,company
J Smith,EMP001,ABC Company Ltd.
Tor Doe,EMP002,XYZ Company Ltd.
Bob,EMP003,ABC Company Ltd.`

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template-participants.csv'
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">ອັບໂຫຼດລາຍຊື່ຜູ້ມີສິດລຸ້ນຮັບລາງວັນ</h2>
        <p className="text-gray-600 mb-6">
          ອັບໂຫຼດໄຟລ໌ Excel (.xlsx, .xls) ທີ່ມີລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">ຂໍ້ມູນທີ່ຈໍາເປັນ:</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
            <li>ຊື່ພະນັກງານ (employee_name ຫຼື ຊື່ພະນັກງານ)</li>
            <li>ລະຫັດພະນັກງານ (employee_id ຫຼື ລະຫັດພະນັກງານ)</li>
            <li>ບໍລິສັດທີ່ສັງກັດ (company ຫຼື ບໍລິສັດ)</li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            ດາວໂຫຼດໄຟລ໌ຕົວຢ່າງ (CSV)
          </button>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <FileSpreadsheet size={64} className="text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {file ? file.name : 'ກິດເພື່ອເລືອກໄຟລ໌ ຫຼືລາກໄຟລ໌ມາວາງທີ່ນີ້'}
              </p>
              <p className="text-sm text-gray-500 mt-1">ຮອງຮັບໄຟລ໌ .xlsx ແລະ .xls</p>
            </div>
          </label>
        </div>

        {/* Upload Button */}
        {file && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>ກໍາລັງອັບໂຫຼດ...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>ອັບໂຫຼດໄຟລ໌</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {result.success ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.message}
              </p>
              {result.details?.errors && (
                <div className="mt-2 text-sm text-red-700">
                  <p className="font-medium">ຂໍ້ຜິດພາດ:</p>
                  <ul className="list-disc list-inside mt-1">
                    {result.details.errors.slice(0, 5).map((err: any, idx: number) => (
                      <li key={idx}>
                        ແຖວ {err.row}: {err.message}
                      </li>
                    ))}
                    {result.details.errors.length > 5 && (
                      <li>... ແລະອີກ {result.details.errors.length - 5} ລາຍການ</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <h3 className="text-xl font-bold mb-3">💡 ຄໍາແນະນໍາ</h3>
        <ul className="space-y-2 text-sm">
          <li>• ລະບົບຈະກວດສອບຄວາມຄົບຖ້ວນຂອງຂໍ້ມູນກ່ອນບັນທຶກເຂົ້າສູ່ລະບົບ</li>
          <li>• ການອັບໂຫຼດຈະເພີ່ມລາຍຊື່ໃໝ່ເຂົ້າລະບົບ (ບໍ່ລຶບຂໍ້ມູນເກົ່າ)</li>
          <li>• ຫາກລະຫັດພະນັກງານຊໍ່າກັບທີ່ມີຢູ່ແລ້ວ ລະບົບຈະຂ່າມລາຍການນັ່ນ</li>
          <li>• ຜູ້ທີ່ໄດ້ຮັບລາງວັນແລ້ວຈະບໍ່ສາມາດລຸ່ນລາງວັນອີກໄດ້</li>
        </ul>
      </div>
    </div>
  )
}
