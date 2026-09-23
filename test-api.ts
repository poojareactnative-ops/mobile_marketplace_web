import { prisma } from './tests/test-utils'
import { runSuite1 } from './tests/suite1-auth-core'
import { runSuite2 } from './tests/suite2-trending-enquiries'
import { runSuite3 } from './tests/suite3-products-categories-uploads'

async function runTests() {
  console.log('\n=================================================================')
  console.log('--- STARTING COMPREHENSIVE BACKEND & ROLE VERIFICATION TESTS ---')
  console.log('=================================================================\n')

  await runSuite1()
  await runSuite2()
  await runSuite3()

  console.log('\n🎉 ALL 72 AUTOMATED TESTS PASSED: COMPLETE ARCHITECTURE & FULL LIFE-CYCLE VERIFIED!\n')
}

runTests()
  .catch((err) => {
    console.error('Test execution failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
