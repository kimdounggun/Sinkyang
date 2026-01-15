import { Router } from 'express'
import { PurchaseAccountController } from '../controllers/purchaseAccount.controller'

const router = Router()

router.get('/', PurchaseAccountController.getAll)
router.get('/:id', PurchaseAccountController.getById)
router.post('/', PurchaseAccountController.create)
router.put('/:id', PurchaseAccountController.update)
router.delete('/:id', PurchaseAccountController.delete)

export default router