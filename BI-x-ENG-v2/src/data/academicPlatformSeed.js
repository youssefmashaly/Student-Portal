/**
 * Seeds interconnected demo data for student + instructor dashboards (localStorage only).
 * `student_projects`: canonical demo rows (stable ids) are merged on every seed run; non-demo projects are preserved.
 * Other keys: written only when missing, empty array, or empty object — never overwrites existing rows.
 */
import { seedDemoUsers } from './authStorage'

const LS = {
  get(k, fb) {
    try {
      const v = localStorage.getItem(k)
      return v ? JSON.parse(v) : fb
    } catch {
      return fb
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v))
  },
}

function missingOrEmpty(key, kind) {
  const raw = localStorage.getItem(key)
  if (raw === null || raw === '') return true
  try {
    const v = JSON.parse(raw)
    if (kind === 'array') return !Array.isArray(v) || v.length === 0
    if (kind === 'object') return !v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length === 0
    return false
  } catch {
    return true
  }
}

const S1 = 'student@student.guc.edu.eg'
const S2 = 'ahmed@student.guc.edu.eg'
const S3 = 'student2@guc.edu.eg'
const INS = 'instructor@guc.edu.eg'
const ADM = 'admin@guc.edu.eg'

const ISO = (s) => s

/** Stable demo project ids — canonical definitions are merged on each seed without touching other projects. */
const DEMO_STUDENT_PROJECT_IDS = new Set([
  'demo-proj-smart-campus-navigator',
  'demo-proj-ai-exam-proctor',
  'demo-proj-thesis-portfolio-platform',
  'demo-proj-private-draft-ethics-rl',
  'demo-proj-guc-events-social-graph',
  'demo-proj-sdn-metrics-pipeline',
])

function mergeCanonicalDemoProjects() {
  const canonical = buildDemoProjects()
  const existing = LS.get('student_projects', [])
  if (!Array.isArray(existing)) {
    LS.set('student_projects', canonical)
    return
  }
  const userProjects = existing.filter((p) => p && p.id && !DEMO_STUDENT_PROJECT_IDS.has(p.id))
  LS.set('student_projects', [...userProjects, ...canonical])
}

function buildDemoProjects() {
  return [
    {
      id: 'demo-proj-smart-campus-navigator',
      title: 'Smart Campus Navigator',
      owner: S1,
      course: 'CSEN 603',
      description:
        'Cross-platform indoor/outdoor navigation for GUC campuses with live occupancy, accessible routes, and offline maps.',
      visibility: 'public',
      createdAt: ISO('2026-02-10T12:00:00.000Z'),
      rating: 5,
      languages: ['TypeScript', 'JavaScript'],
      technologies: ['React Native', 'Mapbox', 'Node.js', 'PostgreSQL'],
      collaborators: [
        { email: INS, status: 'accepted', invitedAt: ISO('2026-02-12T09:00:00.000Z') },
        { email: S2, status: 'accepted', invitedAt: ISO('2026-02-14T11:30:00.000Z') },
      ],
      tasks: [
        {
          id: 'demo-nav-t1',
          title: 'Map tile pipeline',
          description: 'ETL for building footprints and walkways.',
          status: 'completed',
          deadline: '2026-03-01',
          instructorComment: 'Excellent data hygiene — document CRS assumptions.',
        },
        {
          id: 'demo-nav-t2',
          title: 'Accessibility audit',
          description: 'WCAG checks on navigation flows.',
          status: 'completed',
          instructorComment: 'Good coverage of screen reader paths.',
        },
        {
          id: 'demo-nav-t3',
          title: 'Beta rollout on B4',
          description: 'Pilot with 40 students.',
          status: 'pending',
          deadline: '2026-06-01',
          instructorComment: '',
        },
      ],
      github: 'https://github.com/guc-demo/smart-campus-navigator',
      demoVideo: 'https://example.com/demo/smart-campus-navigator',
      thesisDrafts: [
        { id: 'demo-nav-td1', name: 'Technical_Report_v1.pdf', isFinal: false, uploadedAt: ISO('2026-04-01T10:00:00.000Z') },
        { id: 'demo-nav-td2', name: 'Design_Spec_Appendix.pdf', isFinal: false, uploadedAt: ISO('2026-04-18T14:00:00.000Z') },
      ],
      instructorComments: [
        {
          id: 'demo-nav-ic1',
          text: 'Strong integration story between map layers and occupancy API.',
          author: INS,
          at: ISO('2026-04-05T16:00:00.000Z'),
        },
      ],
      progress: 78,
      featured: true,
      flagged: false,
      flagReason: '',
    },
    {
      id: 'demo-proj-ai-exam-proctor',
      title: 'AI Exam Proctoring Assistant',
      owner: S2,
      course: 'CSEN 701',
      description:
        'Privacy-preserving proctoring assistant: gaze estimation, anomaly scoring, and instructor review queue.',
      visibility: 'private',
      createdAt: ISO('2026-03-22T09:30:00.000Z'),
      rating: 0,
      languages: ['Python', 'TypeScript'],
      technologies: ['PyTorch', 'FastAPI', 'WebRTC', 'Redis'],
      collaborators: [
        {
          email: INS,
          status: 'accepted',
          invitedAt: ISO('2026-03-25T14:00:00.000Z'),
        },
      ],
      tasks: [
        {
          id: 'demo-proc-t1',
          title: 'Dataset anonymization',
          description: 'Face-blur pipeline for training clips.',
          status: 'completed',
          instructorComment: '',
        },
        {
          id: 'demo-proc-t2',
          title: 'Review queue UI',
          description: 'Flagged segments for instructors.',
          status: 'pending',
          instructorComment: '',
        },
      ],
      github: 'https://github.com/guc-demo/ai-exam-proctor',
      demoVideo: '',
      thesisDrafts: [],
      instructorComments: [
        {
          id: 'demo-proc-ic1',
          text: 'Accepted advisory role — prioritize ethics appendix before pilot.',
          author: INS,
          at: ISO('2026-05-03T10:00:00.000Z'),
        },
      ],
      progress: 42,
      featured: false,
      flagged: false,
      flagReason: '',
    },
    {
      id: 'demo-proj-thesis-portfolio-platform',
      title: 'Graduation Thesis Portfolio Platform',
      owner: S3,
      course: 'Bachelor Project',
      description:
        'A portfolio hub for thesis teams: milestones, reviews, versioning, and defense scheduling integrated with Git.',
      visibility: 'public',
      createdAt: ISO('2025-10-05T10:15:00.000Z'),
      rating: 5,
      languages: ['TypeScript', 'Go'],
      technologies: ['Next.js', 'PostgreSQL', 'Temporal', 'Docker'],
      collaborators: [{ email: INS, status: 'accepted', invitedAt: ISO('2025-10-08T13:00:00.000Z') }],
      tasks: [
        {
          id: 'demo-thesis-t1',
          title: 'Defense scheduler',
          description: 'Slot booking with ICS export.',
          status: 'completed',
          instructorComment: 'Calendar export works well.',
        },
      ],
      github: 'https://github.com/guc-demo/thesis-portfolio-platform',
      demoVideo: 'https://example.com/demo/thesis-portfolio',
      thesisDrafts: [
        { id: 'demo-thesis-td1', name: 'Thesis_Chapter3_draft.pdf', isFinal: false, uploadedAt: ISO('2026-02-20T11:00:00.000Z') },
        {
          id: 'demo-thesis-td2',
          name: 'Final_Thesis_PortfolioPlatform.pdf',
          isFinal: true,
          uploadedAt: ISO('2026-05-01T09:30:00.000Z'),
        },
      ],
      instructorComments: [
        {
          id: 'demo-thesis-ic1',
          text: 'Final thesis PDF reviewed — approved for committee.',
          author: INS,
          at: ISO('2026-05-02T10:00:00.000Z'),
        },
      ],
      progress: 92,
      featured: true,
      flagged: false,
      flagReason: '',
    },
    {
      id: 'demo-proj-private-draft-ethics-rl',
      title: 'Ethics-Aware RL for Course Scheduling (draft)',
      owner: S1,
      course: 'CSEN 701',
      description: 'Private draft: constrained RL for timetable optimization with fairness metrics (not published).',
      visibility: 'private',
      createdAt: ISO('2026-04-28T15:00:00.000Z'),
      rating: 4,
      languages: ['Python'],
      technologies: ['Gymnasium', 'OR-Tools', 'Streamlit'],
      collaborators: [{ email: INS, status: 'accepted', invitedAt: ISO('2026-04-29T10:00:00.000Z') }],
      tasks: [
        {
          id: 'demo-draft-t1',
          title: 'Fairness metric design',
          description: 'Define utilization vs. load balance trade-offs.',
          status: 'postponed',
          deadline: '2026-06-15',
          instructorComment: 'Postponed per sync — revisit after midterms.',
        },
        {
          id: 'demo-draft-t2',
          title: 'Simulator harness',
          description: 'Synthetic student cohort generator.',
          status: 'postponed',
          instructorComment: 'Good start; add edge cases for lab clashes.',
        },
        {
          id: 'demo-draft-t3',
          title: 'Baseline greedy scheduler',
          description: 'Reference implementation.',
          status: 'completed',
          instructorComment: 'Clean baseline for ablations.',
        },
      ],
      github: 'https://github.com/guc-demo/ethics-rl-scheduling',
      demoVideo: '',
      thesisDrafts: [],
      instructorComments: [
        {
          id: 'demo-draft-ic1',
          text: 'Draft feedback: tighten problem statement and cite recent fairness-in-RL surveys.',
          author: INS,
          at: ISO('2026-05-04T12:00:00.000Z'),
        },
      ],
      progress: 35,
      featured: false,
      flagged: true,
      flagReason: 'Policy review: verify IRB / data-use documentation for scheduling datasets (admin).',
    },
    {
      id: 'demo-proj-sdn-metrics-pipeline',
      title: 'SDN Traffic Metrics Pipeline',
      owner: S1,
      course: 'CSEN 603',
      description:
        'OpenFlow-based collection of per-flow metrics on the teaching lab SDN topology; Grafana dashboards and anomaly alerts.',
      visibility: 'private',
      createdAt: ISO('2026-05-08T10:00:00.000Z'),
      rating: 0,
      languages: ['Python', 'Go'],
      technologies: ['Open vSwitch', 'Grafana', 'gRPC', 'Redis'],
      collaborators: [{ email: INS, status: 'pending', invitedAt: ISO('2026-05-10T08:00:00.000Z') }],
      tasks: [
        {
          id: 'demo-sdn-t1',
          title: 'Controller plugin scaffold',
          description: 'Read flow stats from Ryu app.',
          status: 'pending',
          deadline: '2026-05-20',
          instructorComment: '',
        },
      ],
      github: 'https://github.com/guc-demo/sdn-metrics-pipeline',
      demoVideo: '',
      thesisDrafts: [],
      instructorComments: [],
      progress: 22,
      featured: false,
      flagged: false,
      flagReason: '',
    },
    {
      id: 'demo-proj-guc-events-social-graph',
      title: 'GUC Events Social Graph',
      owner: S3,
      course: 'CSEN 603',
      description:
        'Featured public project: graph analytics over campus events, club memberships, and collaborative filtering for recommendations.',
      visibility: 'public',
      createdAt: ISO('2026-01-18T11:45:00.000Z'),
      rating: 5,
      languages: ['Python', 'Cypher'],
      technologies: ['Neo4j', 'FastAPI', 'D3.js', 'Redis'],
      collaborators: [
        { email: S2, status: 'accepted', invitedAt: ISO('2026-02-01T10:00:00.000Z') },
      ],
      tasks: [
        {
          id: 'demo-graph-t1',
          title: 'Graph ingestion',
          description: 'ETL from events CSV.',
          status: 'completed',
          instructorComment: '',
        },
      ],
      github: 'https://github.com/guc-demo/guc-events-graph',
      demoVideo: 'https://example.com/demo/guc-events-graph',
      thesisDrafts: [],
      instructorComments: [],
      progress: 88,
      featured: true,
      flagged: false,
      flagReason: '',
    },
  ]
}

function buildInternshipsCatalog() {
  const base = (id, title, companyName, location, description, requirements, deadline, duration, skills, languages) => ({
    id,
    title,
    companyName,
    company: companyName,
    companyEmail: 'company@example.com',
    location,
    description,
    requirements,
    deadline,
    duration,
    skills,
    languages,
    details: `📍 ${location}\n\n${description}\n\nRequirements: ${requirements}`,
    postedAt: ISO('2026-04-01T08:00:00.000Z'),
    status: 'hiring',
    archived: false,
  })
  return [
    base(
      'demo-int-siemens',
      'Industrial IoT Engineering Intern',
      'Siemens',
      'Cairo, Egypt',
      'Work on edge telemetry pipelines for manufacturing dashboards.',
      'Strong C++ or Python, basic networking, GPA 3.2+.',
      '2026-09-15',
      '6 months',
      ['C++', 'Python', 'MQTT'],
      ['C++', 'Python'],
    ),
    base(
      'demo-int-microsoft',
      'Cloud Software Engineer Intern',
      'Microsoft',
      'Remote (MENA)',
      'Azure microservices, observability, and reliability for education-sector workloads.',
      'Algorithms, distributed systems coursework, Git.',
      '2026-08-30',
      '3 months',
      ['Azure', 'Kubernetes', 'TypeScript'],
      ['TypeScript', 'C#'],
    ),
    base(
      'demo-int-valeo',
      'ADAS Perception Intern',
      'Valeo',
      'Cairo / Smart Village',
      'Sensor fusion experiments and evaluation tooling for ADAS stacks.',
      'Computer vision basics, MATLAB or Python.',
      '2026-07-20',
      '4 months',
      ['Computer Vision', 'Python'],
      ['Python'],
    ),
    base(
      'demo-int-vodafone',
      '5G Network Analytics Intern',
      'Vodafone',
      'Cairo',
      'Analyze KPI datasets and build internal reporting dashboards.',
      'SQL, statistics, communication skills.',
      '2026-07-01',
      '3 months',
      ['SQL', 'Power BI', 'Python'],
      ['Python', 'SQL'],
    ),
    base(
      'demo-int-orange',
      'Full-Stack Fellow — Orange Digital Center',
      'Orange Digital Center',
      'Alexandria',
      'Mentored cohort building MVPs for local NGOs; focus on React and Node.',
      'Portfolio with 2+ web projects, teamwork.',
      '2026-06-25',
      '2 months',
      ['React', 'Node.js'],
      ['JavaScript', 'TypeScript'],
    ),
  ]
}

function seedInstructorOnlyKeys(email) {
  if (!email) return

  const profileKey = `instructor_profile_${email}`
  if (missingOrEmpty(profileKey, 'object')) {
    LS.set(profileKey, {
      firstName: '',
      lastName: '',
      bio: 'Associate professor in software engineering; advises CSEN 603/701 and Bachelor Project teams.',
      research: 'Applied ML, HCI for learning tools, and software architecture for campus-scale systems.',
      education: 'Ph.D. Computer Science; M.Sc. Software Engineering — GUC.',
    })
  }

  const coursesKey = `instructor_courses_${email}`
  if (missingOrEmpty(coursesKey, 'array')) {
    LS.set(coursesKey, ['Bachelor Project', 'CSEN 603', 'CSEN 701'])
  }

  const notifsKey = `instructor_notifs_${email}`
  if (missingOrEmpty(notifsKey, 'array')) {
    LS.set(notifsKey, [
      {
        id: 'demo-ins-n1',
        read: false,
        message: `Collaboration update: ${S2} joined "Smart Campus Navigator" as an accepted collaborator.`,
        createdAt: ISO('2026-05-06T09:00:00.000Z'),
      },
      {
        id: 'demo-ins-n2',
        read: false,
        message: `Thesis draft reviewed for "Graduation Thesis Portfolio Platform" — see comments in Projects.`,
        createdAt: ISO('2026-05-03T14:20:00.000Z'),
      },
      {
        id: 'demo-ins-n3',
        read: false,
        message: `Task deadline approaching: "Beta rollout on B4" (Smart Campus Navigator).`,
        createdAt: ISO('2026-05-09T08:00:00.000Z'),
      },
      {
        id: 'demo-ins-n4',
        read: false,
        message: `New private message from ${S1}.`,
        createdAt: ISO('2026-05-08T16:45:00.000Z'),
      },
      {
        id: 'demo-ins-n5',
        read: false,
        message: `Project "Ethics-Aware RL for Course Scheduling (draft)" was flagged by ${ADM}: review policy compliance.`,
        createdAt: ISO('2026-05-07T11:00:00.000Z'),
      },
      {
        id: 'demo-ins-n6',
        read: true,
        message: `Pending invitation: ${S1} invited you to co-advise "SDN Traffic Metrics Pipeline".`,
        createdAt: ISO('2026-05-02T10:00:00.000Z'),
      },
      {
        id: 'demo-ins-n7',
        read: true,
        message: 'Course link request for CSEN 701 was approved.',
        createdAt: ISO('2026-04-28T12:00:00.000Z'),
      },
    ])
  }

  const messagesKey = `instructor_messages_${email}`
  if (missingOrEmpty(messagesKey, 'array')) {
    LS.set(messagesKey, [
      {
        with: S1,
        messages: [
          {
            id: 'demo-imsg-1',
            from: S1,
            text: 'Could you review the navigation beta plan before Thursday?',
            at: ISO('2026-05-08T15:10:00.000Z'),
          },
          {
            id: 'demo-imsg-2',
            from: email,
            text: 'Yes — I left comments in the project thread and will join the stand-up.',
            at: ISO('2026-05-08T15:22:00.000Z'),
          },
        ],
      },
      {
        with: S2,
        messages: [
          {
            id: 'demo-imsg-3',
            from: email,
            text: 'Please add ethics appendix references before we enable the review queue.',
            at: ISO('2026-05-05T09:30:00.000Z'),
          },
          {
            id: 'demo-imsg-4',
            from: S2,
            text: 'Uploaded v2 with citations and anonymization checklist.',
            at: ISO('2026-05-05T18:00:00.000Z'),
          },
        ],
      },
      {
        with: ADM,
        messages: [
          {
            id: 'demo-imsg-5',
            from: ADM,
            text: 'Please confirm review of flagged draft project within 5 business days.',
            at: ISO('2026-05-07T11:05:00.000Z'),
          },
        ],
      },
    ])
  }
}

function seedStudentSideKeys() {
  const internships = buildInternshipsCatalog()

  mergeCanonicalDemoProjects()

  if (missingOrEmpty('student_internships', 'array')) {
    LS.set('student_internships', internships)
  }

  const empInternKey = 'employer_internships_company@example.com'
  if (missingOrEmpty(empInternKey, 'array')) {
    LS.set(empInternKey, internships)
  }

  const profiles = [
    {
      key: `student_profile_${S1}`,
      data: {
        firstName: 'Demo',
        lastName: 'Student',
        email: S1,
        major: 'Computer Science',
        linkedin: 'https://linkedin.com/in/demo-student-guc',
        skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'Git'],
      },
    },
    {
      key: `student_profile_${S2}`,
      data: {
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        email: S2,
        major: 'Computer Science',
        linkedin: 'https://linkedin.com/in/ahmed-mohamed-guc',
        skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'Git'],
      },
    },
    {
      key: `student_profile_${S3}`,
      data: {
        firstName: 'Sara',
        lastName: 'El-Masry',
        email: S3,
        major: 'Computer Science',
        linkedin: 'https://linkedin.com/in/sara-elmasry-guc',
        skills: ['Go', 'PostgreSQL', 'UI/UX', 'System Design', 'Git'],
      },
    },
  ]

  for (const { key, data } of profiles) {
    if (missingOrEmpty(key, 'object')) {
      LS.set(key, data)
    }
  }

  const studentNotifs = {
    [S1]: [
      {
        id: 'demo-sn-s1-1',
        read: false,
        message: `${INS} accepted your instructor collaboration on "Smart Campus Navigator".`,
        createdAt: ISO('2026-05-06T09:05:00.000Z'),
      },
      {
        id: 'demo-sn-s1-2',
        read: false,
        message: 'Thesis draft reviewed: see instructor comments on "Smart Campus Navigator" technical report.',
        createdAt: ISO('2026-05-04T13:00:00.000Z'),
      },
      {
        id: 'demo-sn-s1-3',
        read: false,
        message: 'Task deadline approaching: "Beta rollout on B4" — due June 1.',
        createdAt: ISO('2026-05-09T07:30:00.000Z'),
      },
      {
        id: 'demo-sn-s1-4',
        read: false,
        message: `${S2} was added as an accepted collaborator on "Smart Campus Navigator".`,
        createdAt: ISO('2026-05-03T10:00:00.000Z'),
      },
      {
        id: 'demo-sn-s1-5',
        read: false,
        message: `New private message from ${INS}.`,
        createdAt: ISO('2026-05-08T16:50:00.000Z'),
      },
      {
        id: 'demo-sn-s1-6',
        read: false,
        message: `Your project "Ethics-Aware RL for Course Scheduling (draft)" was flagged by ${ADM}.`,
        createdAt: ISO('2026-05-07T11:10:00.000Z'),
      },
    ],
    [S2]: [
      {
        id: 'demo-sn-s2-1',
        read: false,
        message: `${INS} accepted your instructor collaboration on "AI Exam Proctoring Assistant".`,
        createdAt: ISO('2026-05-03T10:15:00.000Z'),
      },
      {
        id: 'demo-sn-s2-2',
        read: false,
        message: `You were added as collaborator on "Smart Campus Navigator" (${S1}).`,
        createdAt: ISO('2026-05-03T10:05:00.000Z'),
      },
      {
        id: 'demo-sn-s2-3',
        read: true,
        message: 'Application update: Microsoft Cloud internship — status pending review.',
        createdAt: ISO('2026-04-25T09:00:00.000Z'),
      },
    ],
    [S3]: [
      {
        id: 'demo-sn-s3-1',
        read: false,
        message: `${INS} signed off on your final thesis PDF for "Graduation Thesis Portfolio Platform".`,
        createdAt: ISO('2026-05-02T10:30:00.000Z'),
      },
      {
        id: 'demo-sn-s3-2',
        read: true,
        message: 'New collaborator accepted on "GUC Events Social Graph".',
        createdAt: ISO('2026-02-02T12:00:00.000Z'),
      },
    ],
  }

  for (const [email, list] of Object.entries(studentNotifs)) {
    const k = `student_notifs_${email}`
    if (missingOrEmpty(k, 'array')) LS.set(k, list)
  }

  const msgThreads = {
    [S1]: [
      {
        with: S2,
        messages: [
          {
            id: 'demo-smsg-1',
            from: S2,
            text: 'Can you share the Mapbox token for the navigator demo?',
            at: ISO('2026-05-05T11:00:00.000Z'),
          },
          {
            id: 'demo-smsg-2',
            from: S1,
            text: 'Sent via encrypted paste — expires in 24h.',
            at: ISO('2026-05-05T11:12:00.000Z'),
          },
        ],
      },
      {
        with: INS,
        messages: [
          {
            id: 'demo-smsg-3',
            from: S1,
            text: 'Could you review the navigation beta plan before Thursday?',
            at: ISO('2026-05-08T15:10:00.000Z'),
          },
          {
            id: 'demo-smsg-4',
            from: INS,
            text: 'Yes — I left comments in the project thread and will join the stand-up.',
            at: ISO('2026-05-08T15:22:00.000Z'),
          },
        ],
      },
      {
        with: ADM,
        messages: [
          {
            id: 'demo-smsg-5',
            from: ADM,
            text: 'Policy reminder: private drafts must not use production student data without IRB.',
            at: ISO('2026-05-07T09:00:00.000Z'),
          },
        ],
      },
    ],
    [S2]: [
      {
        with: INS,
        messages: [
          {
            id: 'demo-smsg-6',
            from: INS,
            text: 'Please add ethics appendix references before we enable the review queue.',
            at: ISO('2026-05-05T09:30:00.000Z'),
          },
          {
            id: 'demo-smsg-7',
            from: S2,
            text: 'Uploaded v2 with citations and anonymization checklist.',
            at: ISO('2026-05-05T18:00:00.000Z'),
          },
        ],
      },
      {
        with: S1,
        messages: [
          {
            id: 'demo-smsg-8',
            from: S1,
            text: 'Sync on shared milestones for Smart Campus Navigator?',
            at: ISO('2026-05-01T13:00:00.000Z'),
          },
        ],
      },
    ],
    [S3]: [
      {
        with: INS,
        messages: [
          {
            id: 'demo-smsg-9',
            from: S3,
            text: 'Final thesis PDF submitted — please confirm defense slot.',
            at: ISO('2026-05-01T08:00:00.000Z'),
          },
          {
            id: 'demo-smsg-10',
            from: INS,
            text: 'Received — defense scheduled for May 18.',
            at: ISO('2026-05-02T09:00:00.000Z'),
          },
        ],
      },
    ],
  }

  for (const [email, threads] of Object.entries(msgThreads)) {
    const k = `student_messages_${email}`
    if (missingOrEmpty(k, 'array')) LS.set(k, threads)
  }

  const applicationsByStudent = {
    [S1]: [
      {
        id: 'demo-app-s1-1',
        internshipId: 'demo-int-siemens',
        studentEmail: S1,
        coverLetter: 'I have IoT coursework and embedded projects; eager to contribute to telemetry pipelines.',
        appliedAt: ISO('2026-04-20T10:00:00.000Z'),
        status: 'pending',
      },
      {
        id: 'demo-app-s1-2',
        internshipId: 'demo-int-microsoft',
        studentEmail: S1,
        coverLetter: 'Strong in TypeScript and distributed systems labs.',
        appliedAt: ISO('2026-04-18T14:30:00.000Z'),
        status: 'accepted',
      },
      {
        id: 'demo-app-s1-3',
        internshipId: 'demo-int-valeo',
        studentEmail: S1,
        coverLetter: 'Computer vision course project on lane detection.',
        appliedAt: ISO('2026-04-10T09:00:00.000Z'),
        status: 'rejected',
      },
    ],
    [S2]: [
      {
        id: 'demo-app-s2-1',
        internshipId: 'demo-int-vodafone',
        studentEmail: S2,
        coverLetter: 'SQL and analytics coursework; Vodafone case study in coursework.',
        appliedAt: ISO('2026-04-22T11:00:00.000Z'),
        status: 'pending',
      },
      {
        id: 'demo-app-s2-2',
        internshipId: 'demo-int-orange',
        studentEmail: S2,
        coverLetter: 'Full-stack capstone and NGO volunteer site.',
        appliedAt: ISO('2026-04-15T16:00:00.000Z'),
        status: 'accepted',
      },
    ],
  }

  for (const [email, apps] of Object.entries(applicationsByStudent)) {
    const k = `student_applications_${email}`
    if (missingOrEmpty(k, 'array')) LS.set(k, apps)
  }

  const employerApps = [
    ...(applicationsByStudent[S1] || []),
    ...(applicationsByStudent[S2] || []),
  ]
  const empAppKey = 'employer_applications_company@example.com'
  if (missingOrEmpty(empAppKey, 'array')) {
    LS.set(empAppKey, employerApps)
  }

  const favFeatured = ['demo-proj-smart-campus-navigator', 'demo-proj-guc-events-social-graph', 'demo-proj-thesis-portfolio-platform']
  const favByEmail = {
    [S1]: favFeatured,
    [S2]: ['demo-proj-smart-campus-navigator', 'demo-proj-guc-events-social-graph'],
    [S3]: ['demo-proj-smart-campus-navigator'],
  }
  for (const [email, ids] of Object.entries(favByEmail)) {
    const k = `student_fav_projects_${email}`
    if (missingOrEmpty(k, 'array')) LS.set(k, ids)
  }
}

/**
 * @param {{ instructorEmail?: string }} [options]
 */
export function seedAcademicPlatformDemoData(options = {}) {
  seedDemoUsers()
  seedStudentSideKeys()
  const { instructorEmail } = options
  if (instructorEmail) {
    seedInstructorOnlyKeys(instructorEmail)
  }
}
