/**
 * Built-in Question Sets for CBT Mock Test Engine
 * Allows 100% offline instant execution without relying on fetch/CORS.
 */

const BUILTIN_TEST_SETS = {
  jee: {
    id: "jee-stem-mock",
    title: "National STEM Entrance Mock Examination",
    category: "Engineering & Medical",
    description: "15 questions covering Physics, Chemistry, and Mathematics with +4/-1 marking scheme.",
    totalDurationMinutes: 45,
    defaultPositiveMarks: 4,
    defaultNegativeMarks: 1,
    sections: [
      { id: "physics", name: "Physics", positiveMarks: 4, negativeMarks: 1 },
      { id: "chemistry", name: "Chemistry", positiveMarks: 4, negativeMarks: 1 },
      { id: "mathematics", name: "Mathematics", positiveMarks: 4, negativeMarks: 1 }
    ],
    questions: [
      {
        id: 1,
        section: "physics",
        type: "mcq",
        question: "What is the SI unit of electric charge?",
        options: ["Volt", "Coulomb", "Ohm", "Tesla"],
        correctOption: 1,
        explanation: "The SI unit of electric charge is Coulomb (C). One coulomb represents the quantity of charge transferred by a steady current of one ampere in one second (Q = I × t).",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 2,
        section: "physics",
        type: "mcq",
        question: "A particle moves in a circle of radius R with constant speed v. What is the magnitude of its acceleration and direction?",
        options: [
          "v²/R directed towards the center",
          "v²/R directed tangentially",
          "v/R directed outwards",
          "Zero because speed is constant"
        ],
        correctOption: 0,
        explanation: "In uniform circular motion, although the speed is constant, the direction of velocity changes continuously. This produces a centripetal acceleration of magnitude a = v²/R directed radially inward toward the center of curvature.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 3,
        section: "physics",
        type: "mcq",
        question: "According to the First Law of Thermodynamics, if 150 J of heat is added to a system and the system performs 40 J of work on its surroundings, what is the change in internal energy (ΔU)?",
        options: ["+190 J", "-110 J", "+110 J", "+6000 J"],
        correctOption: 2,
        explanation: "From the First Law of Thermodynamics, ΔQ = ΔU + W. Rearranging gives ΔU = ΔQ - W = 150 J - 40 J = +110 J.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 4,
        section: "physics",
        type: "mcq",
        question: "The de Broglie wavelength of an electron accelerated through a potential difference of V volts is approximately given by:",
        options: [
          "λ = 12.27 / √V Å",
          "λ = 0.286 / √V Å",
          "λ = 1.227 × V Å",
          "λ = √V / 12.27 Å"
        ],
        correctOption: 0,
        explanation: "For an electron accelerated through potential V, momentum p = √(2meV). The de Broglie wavelength λ = h/p = h/√(2meV) ≈ 12.27 / √V Ångströms.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 5,
        section: "physics",
        type: "mcq",
        question: "In Young's double slit experiment, if the separation between the slits is halved and the distance to the screen is doubled, the fringe width will:",
        options: [
          "Remain unchanged",
          "Double",
          "Quadruple (become 4 times)",
          "Become one-fourth"
        ],
        correctOption: 2,
        explanation: "Fringe width β = λD / d. If d' = d/2 and D' = 2D, the new fringe width β' = λ(2D) / (d/2) = 4(λD / d) = 4β.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 6,
        section: "chemistry",
        type: "mcq",
        question: "Which of the following molecules has a zero net dipole moment?",
        options: ["NH₃", "H₂O", "BF₃", "SO₂"],
        correctOption: 2,
        explanation: "Boron trifluoride (BF₃) has a trigonal planar geometry with 120° bond angles (sp² hybridization). The three equivalent B-F dipoles cancel symmetrically to give a net dipole moment of zero.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 7,
        section: "chemistry",
        type: "mcq",
        question: "For a zero-order reaction A → Products, the unit of the rate constant (k) is:",
        options: ["s⁻¹", "mol L⁻¹ s⁻¹", "L mol⁻¹ s⁻¹", "mol⁻² L² s⁻¹"],
        correctOption: 1,
        explanation: "For an nth-order reaction, units of k are (mol L⁻¹)^(1-n) s⁻¹. For n = 0, units are mol L⁻¹ s⁻¹.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 8,
        section: "chemistry",
        type: "mcq",
        question: "What is the oxidation state of Chromium in Potassium Dichromate (K₂Cr₂O₇)?",
        options: ["+3", "+4", "+6", "+7"],
        correctOption: 2,
        explanation: "In K₂Cr₂O₇: 2(+1) + 2(Cr) + 7(-2) = 0 ⇒ 2 + 2(Cr) - 14 = 0 ⇒ 2(Cr) = 12 ⇒ Cr = +6.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 9,
        section: "chemistry",
        type: "mcq",
        question: "Which of the following compounds gives a positive Tollens' test (Silver Mirror)?",
        options: ["Acetone (Propanone)", "Acetaldehyde (Ethanal)", "Acetophenone", "Benzophenone"],
        correctOption: 1,
        explanation: "Tollens' reagent is reduced to metallic silver by aldehydes such as acetaldehyde (CH₃CHO), whereas aliphatic and aromatic ketones generally do not react.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 10,
        section: "chemistry",
        type: "mcq",
        question: "According to Le Chatelier's principle, an increase in external pressure on the equilibrium N₂(g) + 3H₂(g) ⇌ 2NH₃(g) will:",
        options: [
          "Favor the forward reaction",
          "Favor the backward reaction",
          "Have no effect on equilibrium composition",
          "Decrease the yield of NH₃"
        ],
        correctOption: 0,
        explanation: "Reactants have 4 moles of gas; products have 2 moles. Increasing pressure shifts the system towards the side with fewer gas moles, favoring the forward synthesis of NH₃.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 11,
        section: "mathematics",
        type: "mcq",
        question: "If matrix A is an orthogonal matrix of order 3, what are the possible values of det(A)?",
        options: ["0 only", "±1", "3 or -3", "Any positive real number"],
        correctOption: 1,
        explanation: "By definition, A · Aᵀ = I. Taking determinants: det(A) · det(Aᵀ) = [det(A)]² = det(I) = 1. Therefore det(A) = ±1.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 12,
        section: "mathematics",
        type: "mcq",
        question: "Evaluate the limit: lim (x → 0) [(sin 3x) / x]",
        options: ["0", "1", "3", "Does not exist"],
        correctOption: 2,
        explanation: "lim (x → 0) [sin(3x) / x] = 3 · lim (x → 0) [sin(3x) / (3x)] = 3 · 1 = 3.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 13,
        section: "mathematics",
        type: "mcq",
        question: "What is the derivative of f(x) = ln(sec x + tan x) with respect to x?",
        options: ["sec x", "tan x", "sec² x", "sec x tan x"],
        correctOption: 0,
        explanation: "f'(x) = [sec x tan x + sec² x] / [sec x + tan x] = [sec x(tan x + sec x)] / [sec x + tan x] = sec x.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 14,
        section: "mathematics",
        type: "mcq",
        question: "The value of the definite integral ∫ from 0 to π/2 of [sin x / (sin x + cos x)] dx is:",
        options: ["π", "π/2", "π/4", "1"],
        correctOption: 2,
        explanation: "Applying the symmetry property ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx yields 2I = ∫₀^(π/2) 1 dx = π/2 ⇒ I = π/4.",
        positiveMarks: 4,
        negativeMarks: 1
      },
      {
        id: 15,
        section: "mathematics",
        type: "mcq",
        question: "Two cards are drawn simultaneously from a standard well-shuffled 52-card deck without replacement. What is the probability that both are aces?",
        options: ["1 / 221", "4 / 663", "1 / 169", "2 / 52"],
        correctOption: 0,
        explanation: "P(both aces) = (4/52) × (3/51) = (1/13) × (1/17) = 1 / 221.",
        positiveMarks: 4,
        negativeMarks: 1
      }
    ]
  },

  gate: {
    id: "gate-cs-mock",
    title: "GATE Computer Science & IT Mock Test",
    category: "Higher Engineering / GATE",
    description: "15 questions covering Data Structures, Operating Systems, and Computer Networks with +2 / -0.66 marking.",
    totalDurationMinutes: 30,
    defaultPositiveMarks: 2,
    defaultNegativeMarks: 0.66,
    csvRaw: `section,question,optionA,optionB,optionC,optionD,correctOption,positiveMarks,negativeMarks,explanation
Data Structures,What is the worst-case time complexity of QuickSort on an array of n elements?,O(n log n),O(n),O(n^2),O(log n),C,2,0.66,Worst-case occurs when the selected pivot is consistently the extreme element resulting in O(n^2) comparisons.
Data Structures,Which data structure is fundamentally used for Breadth-First Search (BFS) graph traversal?,Stack,Queue,Priority Queue,Binary Search Tree,B,2,0.66,BFS explores vertices level-by-level which is strictly maintained using a FIFO Queue.
Data Structures,In a min-heap with n elements where does the maximum element reside?,Always at the root,In the left subtree of root only,At one of the leaf nodes,Always at index n/2,C,2,0.66,In a min-heap parents are <= children. Therefore the maximum element cannot have children and must reside at a leaf node.
Data Structures,What is the height of a balanced AVL tree with n nodes?,O(log n),O(n),O(n log n),O(sqrt(n)),A,2,0.66,AVL trees guarantee a balance factor between -1 and +1 ensuring the height is bounded by O(log n).
Data Structures,Which of the following sorting algorithms is stable and has worst-case time complexity of O(n log n)?,Heap Sort,Quick Sort,Merge Sort,Selection Sort,C,2,0.66,Merge Sort is both stable and guarantees O(n log n) comparisons in the worst case.
Operating Systems,Which of the following conditions is NOT required for a deadlock to occur?,Mutual Exclusion,Hold and Wait,Preemption allowed,Circular Wait,C,2,0.66,Coffman conditions are: Mutual exclusion, Hold and wait, No preemption, and Circular wait. If preemption is allowed, deadlock cannot occur.
Operating Systems,Belady's Anomaly occurs in which page replacement algorithm?,Optimal Page Replacement,Least Recently Used (LRU),First-In-First-Out (FIFO),Most Recently Used (MRU),C,2,0.66,Belady's anomaly occurs in FIFO where increasing the number of page frames leads to more page faults.
Operating Systems,What state transition is triggered when an I/O operation requested by a running process completes?,Running to Ready,Blocked/Waiting to Ready,Running to Blocked,Terminated to Ready,B,2,0.66,When a blocked process finishes I/O, it transitions back to the Ready state awaiting CPU scheduling.
Operating Systems,A critical section in operating systems refers to:,A section of code that performs network I/O,A piece of code that accesses shared resources that must not be concurrently accessed by multiple threads,The memory space reserved exclusively for the OS kernel,The boot sector on the storage drive,B,2,0.66,A critical section accesses shared resources and requires mutual exclusion to prevent race conditions.
Operating Systems,Which CPU scheduling algorithm gives the minimum average waiting time for a given set of processes?,First Come First Served (FCFS),Shortest Job First (SJF / SRTF),Round Robin (RR),Priority Scheduling,B,2,0.66,Shortest Job First (SJF) is mathematically optimal for minimizing average waiting time.
Computer Networks,Which layer of the OSI model is responsible for end-to-end reliable data delivery and flow control?,Network Layer,Data Link Layer,Transport Layer,Session Layer,C,2,0.66,Transport Layer (Layer 4) provides reliable end-to-end transport, error recovery, and flow control (e.g., TCP).
Computer Networks,What is the size of an IPv6 address?,32 bits,64 bits,128 bits,256 bits,C,2,0.66,IPv6 addresses are 128 bits long (16 bytes), formatted as eight 16-bit hex blocks.
Computer Networks,Which protocol uses UDP port 53 for standard name resolution queries?,HTTP,DNS,FTP,DHCP,B,2,0.66,DNS primarily uses UDP on port 53 for standard queries due to minimal latency overhead.
Computer Networks,In the TCP 3-way handshake what flag sequence is sent by the server in response to the initial client SYN?,ACK only,SYN only,SYN-ACK,FIN-ACK,C,2,0.66,The server responds with SYN-ACK to acknowledge the client's sequence while providing its own initial sequence number.
Computer Networks,What mechanism does Ethernet use for media access control on half-duplex shared links?,CSMA/CA,CSMA/CD,Token Ring,Slotted ALOHA,B,2,0.66,Half-duplex Ethernet uses Carrier Sense Multiple Access with Collision Detection (CSMA/CD).`
  }
};
