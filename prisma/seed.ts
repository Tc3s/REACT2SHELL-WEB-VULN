import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/elearning" })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.deleteMany({})
  await prisma.assignment.deleteMany({})
  await prisma.course.deleteMany({})

  const passwordHash = await bcrypt.hash("password123", 10)

  // Seed default users
  await prisma.user.create({
    data: {
      email: "admin@elearning.com",
      passwordHash,
      role: "ADMIN"
    }
  })

  await prisma.user.create({
    data: {
      email: "lecturer@elearning.com",
      passwordHash,
      role: "LECTURER"
    }
  })

  const student = await prisma.user.create({
    data: {
      email: "student@elearning.com",
      passwordHash,
      role: "STUDENT"
    }
  })
  
  // Seed default courses
  const course1 = await prisma.course.create({
    data: {
      id: "mock-course-phy402",
      title: "Advanced Quantum Mechanics & Field Theory (PHY-402)",
      description: "Mathematical foundations of Hilbert spaces, entanglement, and quantum non-locality.",
      instructorId: "lecturer@elearning.com"
    }
  })

  const course2 = await prisma.course.create({
    data: {
      id: "mock-course-csc301",
      title: "Distributed Systems & Cloud Architecture (CSC-301)",
      description: "Consensus algorithms (Paxos, Raft), RPC protocols, fault tolerance, and distributed state.",
      instructorId: "lecturer@elearning.com"
    }
  })

  const course3 = await prisma.course.create({
    data: {
      id: "mock-course-mth205",
      title: "Linear Algebra & Differential Equations (MTH-205)",
      description: "Spectral theorem, matrix decompositions, vector spaces, and boundary value problems.",
      instructorId: "lecturer@elearning.com"
    }
  })

  const course4 = await prisma.course.create({
    data: {
      id: "mock-course-neu108",
      title: "Computational Neuroscience & Neural Models (NEU-108)",
      description: "Biophysical neuron simulations, synaptic plasticity, and biological neural computation.",
      instructorId: "lecturer@elearning.com"
    }
  })

  // Seed default student enrollments
  await prisma.enrollment.createMany({
    data: [
      { studentId: student.id, courseId: course1.id },
      { studentId: student.id, courseId: course2.id },
    ]
  })

  const seed = [
    {
      id: "a1",
      title: "Quantum Entanglement Lab",
      courseId: course1.id,
      dueDate: new Date("2026-10-24T23:59:00Z"),
      metadata: {
        module: "Module 04: Non-locality",
        type: "Lab",
        dueTime: "23:59",
        submissionsDone: 84,
        submissionsTotal: 128,
        status: "Published"
      }
    },
    {
      id: "a2",
      title: "Bell's Inequality Derivation",
      courseId: course1.id,
      dueDate: new Date("2026-10-28T23:59:00Z"),
      metadata: {
        module: "Module 03: Foundations",
        type: "Homework",
        dueTime: "23:59",
        submissionsDone: 15,
        submissionsTotal: 128,
        status: "Published"
      }
    },
    {
      id: "a3",
      title: "Mid-Term Assessment Phase II",
      courseId: course1.id,
      dueDate: new Date("2026-11-05T10:00:00Z"),
      metadata: {
        module: "General Proficiency",
        type: "Quiz",
        dueTime: "10:00",
        submissionsDone: 0,
        submissionsTotal: 128,
        status: "Draft"
      }
    },
    {
      id: "a4",
      title: "Raft Consensus Protocol Implementation",
      courseId: course2.id,
      dueDate: new Date("2026-11-12T23:59:00Z"),
      metadata: {
        module: "Module 02: Distributed Consensus",
        type: "Lab",
        dueTime: "23:59",
        submissionsDone: 42,
        submissionsTotal: 64,
        status: "Published"
      }
    }
  ]

  for (const s of seed) {
    await prisma.assignment.create({ data: s })
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
