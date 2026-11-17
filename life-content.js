/* Authored, level-specific season and connected phone missions. */
const BUKI_LIFE={
  "A1": {
    "title": "The Lantern Party",
    "episodes": [
      {
        "title": "A Light in the Café",
        "lines": [
          [
            "Mia",
            "Hello! We have a party on Friday."
          ],
          [
            "Buki",
            "Can I help?"
          ],
          [
            "Mia",
            "Yes. Bring the blue lantern. It is on the table."
          ]
        ],
        "question": "What does Mia need?",
        "options": [
          "A red bag",
          "A blue lantern",
          "A train ticket"
        ],
        "answer": 1,
        "why": "Mia says: “Bring the blue lantern.”",
        "cliff": "A note is under the lantern. Who wrote it?"
      },
      {
        "title": "The Small Note",
        "lines": [
          [
            "Buki",
            "The note says: “Meet Leo at six.”"
          ],
          [
            "Mia",
            "Leo is at the station."
          ],
          [
            "Leo",
            "Hi! I have the lights. Let’s go to the café."
          ]
        ],
        "question": "Where is Leo?",
        "options": [
          "At the station",
          "At home",
          "At school"
        ],
        "answer": 0,
        "why": "Mia says Leo is at the station.",
        "cliff": "The café door is closed. Where is the key?"
      },
      {
        "title": "The Open Door",
        "lines": [
          [
            "Mia",
            "The key is in my green bag."
          ],
          [
            "Buki",
            "Here it is!"
          ],
          [
            "Leo",
            "Thank you. Now we can start the party."
          ]
        ],
        "question": "Where is the key?",
        "options": [
          "Under a chair",
          "In a red box",
          "In a green bag"
        ],
        "answer": 2,
        "why": "Mia keeps the key in her green bag.",
        "cliff": "The lights are on. Next time, a visitor will bring a surprise."
      }
    ],
    "phone": [
      {
        "app": "messages",
        "source": "Mia: Please bring the lantern to the café on Friday at six.",
        "question": "Choose the reply that confirms the arrangement.",
        "options": [
          "I will bring it. See you at six.",
          "I am at the airport.",
          "I do not have a train."
        ],
        "answer": 0
      },
      {
        "app": "calendar",
        "source": "Friday · 18:00 · Lantern party · Café",
        "question": "Save the correct calendar entry.",
        "options": [
          "Friday, 18:00, Café",
          "Monday, 09:00, Station",
          "Friday, 08:00, Library"
        ],
        "answer": 0
      },
      {
        "app": "delivery",
        "source": "Your lantern box is at the library. Collect it before 17:00.",
        "question": "Choose the action that solves the delivery problem.",
        "options": [
          "Collect it at the library before five.",
          "Wait at the café until seven.",
          "Go to the station tomorrow."
        ],
        "answer": 0
      }
    ]
  },
  "A2": {
    "title": "The Missing Music",
    "episodes": [
      {
        "title": "A Quiet Rehearsal",
        "lines": [
          [
            "Mia",
            "We were practising when the speaker stopped."
          ],
          [
            "Leo",
            "I charged it this morning, but I forgot the cable."
          ],
          [
            "Buki",
            "There is another cable at the library. I can collect it."
          ]
        ],
        "question": "Why does Buki go to the library?",
        "options": [
          "To buy a speaker",
          "To collect a cable",
          "To practise alone"
        ],
        "answer": 1,
        "why": "Buki offers to collect the other cable from the library.",
        "cliff": "The library is closing early. Can they get there in time?"
      },
      {
        "title": "A Change of Plan",
        "lines": [
          [
            "Leo",
            "The library closes at five today, not six."
          ],
          [
            "Buki",
            "It is half past four. We have thirty minutes."
          ],
          [
            "Mia",
            "I’ll stay here and tell the guests about the delay."
          ]
        ],
        "question": "How much time is left?",
        "options": [
          "Thirty minutes",
          "Two hours",
          "Five minutes"
        ],
        "answer": 0,
        "why": "From 4:30 to 5:00 there are thirty minutes.",
        "cliff": "They find the cable, but the label belongs to someone else."
      },
      {
        "title": "Permission First",
        "lines": [
          [
            "Buki",
            "This cable belongs to the school. May we borrow it?"
          ],
          [
            "Librarian",
            "Yes, if you return it tomorrow morning."
          ],
          [
            "Mia",
            "The music is back! Let’s thank the school."
          ]
        ],
        "question": "What must they do tomorrow?",
        "options": [
          "Buy a new library",
          "Cancel the concert",
          "Return the cable"
        ],
        "answer": 2,
        "why": "They may borrow it on condition that they return it tomorrow morning.",
        "cliff": "The concert begins. A guest leaves a mysterious song request."
      }
    ],
    "phone": [
      {
        "app": "messages",
        "source": "Mia: Rehearsal has moved from 18:00 to 18:30 on Saturday. Can you still come?",
        "question": "Choose the reply that confirms the arrangement.",
        "options": [
          "Yes, I can come at half past six.",
          "Yes, I came yesterday.",
          "Let’s meet at eight instead."
        ],
        "answer": 0
      },
      {
        "app": "calendar",
        "source": "Saturday · 18:30 · Rehearsal · Café",
        "question": "Save the correct calendar entry.",
        "options": [
          "Saturday, 18:00, Station",
          "Saturday, 18:30, Café",
          "Sunday, 18:30, Café"
        ],
        "answer": 1
      },
      {
        "app": "delivery",
        "source": "The spare cable is ready at the library. It closes at 17:00 today.",
        "question": "Choose the action that solves the delivery problem.",
        "options": [
          "Collect it after six.",
          "Ask for a train ticket.",
          "Collect it before five."
        ],
        "answer": 2
      }
    ]
  },
  "B1": {
    "title": "The Festival Promise",
    "episodes": [
      {
        "title": "A Difficult Forecast",
        "lines": [
          [
            "Mia",
            "We have sold tickets for an outdoor festival, but heavy rain is expected."
          ],
          [
            "Leo",
            "The hall is available, although it holds fewer people."
          ],
          [
            "Buki",
            "We should contact ticket holders before changing the venue."
          ]
        ],
        "question": "What does Buki suggest doing first?",
        "options": [
          "Contacting ticket holders",
          "Cancelling without explanation",
          "Selling more tickets"
        ],
        "answer": 0,
        "why": "Buki wants to inform ticket holders before the venue changes.",
        "cliff": "One ticket holder has travelled a long way and needs accessible seating."
      },
      {
        "title": "A Fair Solution",
        "lines": [
          [
            "Guest",
            "I can attend only if there is step-free access."
          ],
          [
            "Leo",
            "The main entrance has stairs, but the side entrance has a ramp."
          ],
          [
            "Mia",
            "We will reserve seats nearby and send clear directions."
          ]
        ],
        "question": "Which solution meets the guest’s need?",
        "options": [
          "Offer a standing ticket",
          "Use the side entrance and reserve nearby seats",
          "Ask them to arrive after the show"
        ],
        "answer": 1,
        "why": "The ramp provides step-free access, with seats nearby.",
        "cliff": "The delivery driver has taken the decorations to the original venue."
      },
      {
        "title": "The Last Delivery",
        "lines": [
          [
            "Driver",
            "I went to the park because the label still had the old address."
          ],
          [
            "Buki",
            "Could you redirect the boxes to the hall? We will update the instructions."
          ],
          [
            "Mia",
            "Everything arrived. Next year, one person should manage all address changes."
          ]
        ],
        "question": "What would prevent the same problem?",
        "options": [
          "Print fewer tickets",
          "Change the music",
          "Keep delivery instructions up to date"
        ],
        "answer": 2,
        "why": "The old delivery address caused the mistake.",
        "cliff": "The festival succeeds. The town invites the team to organise a bigger event."
      }
    ],
    "phone": [
      {
        "app": "messages",
        "source": "Mia: Sunday’s festival has moved indoors. Please confirm that you can help at the hall at 16:00.",
        "question": "Choose the reply that confirms the arrangement.",
        "options": [
          "I helped last month.",
          "I can help at the hall at four.",
          "Keep my old address."
        ],
        "answer": 1
      },
      {
        "app": "calendar",
        "source": "Sunday · 16:00 · Volunteer briefing · Town hall",
        "question": "Save the correct calendar entry.",
        "options": [
          "Sunday, 16:00, Town hall",
          "Sunday, 16:00, Park",
          "Saturday, 16:00, Town hall"
        ],
        "answer": 0
      },
      {
        "app": "delivery",
        "source": "Delivery attempt: the boxes are at the park. The festival is now at the town hall.",
        "question": "Choose the action that solves the delivery problem.",
        "options": [
          "Leave them at the park.",
          "Cancel the entire festival.",
          "Ask the driver to redirect them to the hall."
        ],
        "answer": 2
      }
    ]
  },
  "B2": {
    "title": "The Unwritten Agreement",
    "episodes": [
      {
        "title": "An Attractive Offer",
        "lines": [
          [
            "Sponsor",
            "We can fund the exhibition provided our logo appears on every label."
          ],
          [
            "Mia",
            "That may imply we endorse your products. Our policy rules out commercial endorsements."
          ],
          [
            "Buki",
            "Could we acknowledge the contribution on a separate board instead?"
          ]
        ],
        "question": "What is Buki trying to achieve?",
        "options": [
          "Hide the sponsor entirely",
          "Accept every condition",
          "Recognise support without implying endorsement"
        ],
        "answer": 2,
        "why": "A separate acknowledgement can recognise funding without putting branding on each exhibit.",
        "cliff": "The sponsor agrees verbally, but the written contract says something different."
      },
      {
        "title": "Between the Lines",
        "lines": [
          [
            "Leo",
            "The draft still requires exclusive branding. That contradicts yesterday’s conversation."
          ],
          [
            "Mia",
            "We should not sign until the revised wording reflects what was agreed."
          ],
          [
            "Sponsor",
            "I will send an amended version for review."
          ]
        ],
        "question": "What is the most justified next step?",
        "options": [
          "Sign because the sponsor sounded friendly",
          "Review the amended terms before signing",
          "Remove every exhibit"
        ],
        "answer": 1,
        "why": "The written terms must match the agreement before signing.",
        "cliff": "An anonymous message suggests that one exhibit’s ownership is disputed."
      },
      {
        "title": "Evidence Before Headlines",
        "lines": [
          [
            "Reporter",
            "An anonymous source claims that the painting was taken without permission."
          ],
          [
            "Buki",
            "A claim is not proof. Let’s check the loan agreement and contact the owner."
          ],
          [
            "Owner",
            "The signed loan is valid. Please correct the rumour without revealing the source."
          ]
        ],
        "question": "Which headline is supported by the evidence?",
        "options": [
          "Owner confirms authorised loan",
          "Museum caught stealing painting",
          "Anonymous source proven dishonest"
        ],
        "answer": 0,
        "why": "The owner and signed agreement establish an authorised loan, not theft or the source’s motive.",
        "cliff": "The exhibition opens. A sealed envelope proposes the town’s next investigation."
      }
    ],
    "phone": [
      {
        "app": "messages",
        "source": "Mia: Please confirm Tuesday’s contract review at 14:00. We need to check the amended terms before signing.",
        "question": "Choose the reply that confirms the arrangement.",
        "options": [
          "The contract has already been signed.",
          "I’ll attend and review the amended terms before signing.",
          "The anonymous claim proves theft."
        ],
        "answer": 1
      },
      {
        "app": "calendar",
        "source": "Tuesday · 14:00 · Contract review · Gallery office",
        "question": "Save the correct calendar entry.",
        "options": [
          "Tuesday, 16:00, Café",
          "Thursday, 14:00, Gallery office",
          "Tuesday, 14:00, Gallery office"
        ],
        "answer": 2
      },
      {
        "app": "delivery",
        "source": "The painting was sent to the café by mistake. It must remain sealed and be delivered to the gallery office.",
        "question": "Choose the action that solves the delivery problem.",
        "options": [
          "Open the package at the café.",
          "Request a sealed transfer to the gallery office.",
          "Publish the unverified claim."
        ],
        "answer": 1
      }
    ]
  }
};
