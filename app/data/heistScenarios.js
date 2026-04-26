export const heistScenarios = [
  {
    id: 'chapter-1',
    chapter: 1,
    title: 'Phase 1: Infiltration',
    description: 'The team is outside the Target HQ. We need to bypass the biometric perimeter.',
    roles: {
      Hacker: {
        task: 'Clone the security guard\'s RFID signal.',
        questions: [
          {
            text: 'The signal is encrypted with a rolling code. To intercept it, you must identify the correct frequency range for 13.56MHz NFC.',
            options: [
              { text: 'HF (High Frequency)', correct: true },
              { text: 'UHF (Ultra High Frequency)', correct: false },
              { text: 'LF (Low Frequency)', correct: false }
            ]
          }
        ]
      },
      Analyst: {
        task: 'Identify the guard rotation pattern.',
        questions: [
          {
            text: 'The CCTV logs show Guard A moves every 5 mins and Guard B every 8 mins. When will they both be at the north gate simultaneously?',
            options: [
              { text: '40 minutes', correct: true },
              { text: '13 minutes', correct: false },
              { text: '20 minutes', correct: false }
            ]
          }
        ]
      },
      Decoy: {
        task: 'Create a distraction at the main entrance.',
        questions: [
          {
            text: 'To draw all guards to the front, you need to trigger the fire alarm without being seen. Which sensor is least likely to have a camera on it?',
            options: [
              { text: 'Loading Dock Smoke Detector', correct: true },
              { text: 'Main Lobby Heat Sensor', correct: false },
              { text: 'Executive Suite Sprinkler', correct: false }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'chapter-2',
    chapter: 2,
    title: 'Phase 2: The Vault Room',
    description: 'We are inside. The vault is guarded by a triple-lock system.',
    roles: {
      Hacker: {
        task: 'Disable the laser grid.',
        questions: [
          {
            text: 'The grid is controlled by a PLC. To disable it, you must send a "FORCE_OFF" command to which register?',
            options: [
              { text: 'Output Image Table', correct: true },
              { text: 'Input Image Table', correct: false },
              { text: 'System Reserved Memory', correct: false }
            ]
          }
        ]
      },
      Analyst: {
        task: 'Decrypt the vault combination.',
        questions: [
          {
            text: 'The code is hidden in a series of prime numbers: 2, 3, 5, 7, 11, X. What is X?',
            options: [
              { text: '13', correct: true },
              { text: '12', correct: false },
              { text: '15', correct: false }
            ]
          }
        ]
      },
      Decoy: {
        task: 'Jam the backup communication signal.',
        questions: [
          {
            text: 'The backup signal uses a 2.4GHz band. Which household device would create the most effective interference?',
            options: [
              { text: 'Microwave Oven (Running)', correct: true },
              { text: 'Bluetooth Speaker', correct: false },
              { text: 'Smart Lightbulb', correct: false }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'chapter-3',
    chapter: 3,
    title: 'Phase 3: The Getaway',
    description: 'The alarm is tripped! We need to vanish before the response team arrives.',
    roles: {
      Hacker: {
        task: 'Loop the city traffic cameras.',
        questions: [
          {
            text: 'To hide the getaway vehicle, you need to overwrite the last 10 minutes of footage. Which storage protocol is fastest for sequential writes?',
            options: [
              { text: 'NVMe over Fabric', correct: true },
              { text: 'iSCSI', correct: false },
              { text: 'SATA III', correct: false }
            ]
          }
        ]
      },
      Analyst: {
        task: 'Calculate the fastest escape route.',
        questions: [
          {
            text: 'Police blockades are 2 miles North and 3 miles East. The shortest path out of the city is:',
            options: [
              { text: 'Southwest through the tunnel', correct: true },
              { text: 'Straight North past the park', correct: false },
              { text: 'West through the mall', correct: false }
            ]
          }
        ]
      },
      Decoy: {
        task: 'Lead the pursuit vehicles away.',
        questions: [
          {
            text: 'You need to make the police think the team is heading to the airport. Which fake trail is most believable?',
            options: [
              { text: 'Dumping a decoy bag near Terminal 1', correct: true },
              { text: 'Flashing high beams at a patrol car', correct: false },
              { text: 'Driving really fast in circles', correct: false }
            ]
          }
        ]
      }
    }
  }
];
