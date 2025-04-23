import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EsimProfile } from "./EsimProfile"

interface EsimModalProps {
  isOpen: boolean
  onClose: () => void
  orderNo: string
}

export function EsimModal({ isOpen, onClose, orderNo }: EsimModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-green-600">
            Successfully Purchased!
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EsimProfile orderNo={orderNo} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 