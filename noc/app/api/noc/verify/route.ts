import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import crypto from 'crypto'

/**
 * Verify digital signatures on a document
 * Checks signature integrity by comparing stored hashes
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    const nocRequest = await prisma.nOCRequest.findUnique({
      where: { requestId },
      include: {
        signatures: {
          orderBy: { signedAt: 'asc' },
        },
      },
    })

    if (!nocRequest) {
      return NextResponse.json({ error: 'NOC request not found' }, { status: 404 })
    }

    // Verify each signature
    const verificationResults = nocRequest.signatures.map((sig) => {
      // Recalculate hash from stored signature data
      const calculatedHash = crypto
        .createHash('sha256')
        .update(sig.signatureData)
        .digest('hex')

      const isValid = calculatedHash === sig.signatureHash

      return {
        stage: sig.stage,
        signerEmail: sig.signerEmail,
        signerRole: sig.signerRole,
        signedAt: sig.signedAt,
        isValid,
        signatureHash: sig.signatureHash,
        documentHash: sig.documentHash,
        verificationStatus: isValid ? 'VERIFIED' : 'INVALID',
      }
    })

    const allSignaturesValid = verificationResults.every((r) => r.isValid)

    // Determine expected signatures based on passport type
    const expectedSignatures =
      nocRequest.passportType === 'PASSPORT'
        ? ['ESTABLISHMENT', 'JOINT_REGISTRAR', 'REGISTRAR']
        : ['ESTABLISHMENT', 'JOINT_REGISTRAR']

    const collectedStages = nocRequest.signatures.map((s) => s.stage)
    const missingSignatures = expectedSignatures.filter((s) => !collectedStages.includes(s))

    return NextResponse.json({
      success: true,
      requestId: nocRequest.requestId,
      status: nocRequest.status,
      passportType: nocRequest.passportType,
      totalSignatures: nocRequest.signatures.length,
      expectedSignatures: expectedSignatures.length,
      allSignaturesValid,
      isComplete: nocRequest.status === 'COMPLETED' && allSignaturesValid,
      missingSignatures,
      verificationResults,
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Verify] Error verifying signatures:', error)
    return NextResponse.json({ error: 'Failed to verify signatures' }, { status: 500 })
  }
}
