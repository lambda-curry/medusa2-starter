export const texasCustomers = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (512) 555-0123',
    city: 'Austin',
    address_1: '123 Main St',
    postal_code: '78701',
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (512) 555-0124',
    city: 'Austin',
    address_1: '456 Oak Ave',
    postal_code: '78702',
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1 (512) 555-0125',
    city: 'Austin',
    address_1: '789 Pine St',
    postal_code: '78703',
  },
  {
    first_name: 'David',
    last_name: 'Kim',
    email: 'david.kim@example.com',
    phone: '+1 (512) 555-0126',
    city: 'Austin',
    address_1: '321 Elm St',
    postal_code: '78704',
  },
  {
    first_name: 'Lisa',
    last_name: 'Martinez',
    email: 'lisa.martinez@example.com',
    phone: '+1 (512) 555-0127',
    city: 'Austin',
    address_1: '654 Maple Ave',
    postal_code: '78705',
  },
];

// Create diverse product reviews with different ratings and content
export const reviewContents = [
  {
    rating: 5,
    content:
      'This course was exactly what I needed to kickstart my learning journey. The content was well-structured and easy to follow.',
    images: [],
  },
  {
    rating: 5,
    content: 'Excellent course! The instructor was knowledgeable and the practical examples were very helpful.',
    images: [],
  },
  {
    rating: 5,
    content: 'I learned so much from this course. The hands-on exercises really helped solidify the concepts.',
    images: [],
  },
  {
    rating: 4,
    content: 'Great course overall. Would have liked more advanced examples, but still very valuable.',
    images: [],
  },
  {
    rating: 5,
    content: 'The course materials were comprehensive and the support was excellent. Highly recommended!',
    images: [],
  },
  {
    rating: 4,
    content: 'Good course for beginners. The pace was just right and the explanations were clear.',
    images: [],
  },
  {
    rating: 5,
    content: 'This course exceeded my expectations. The practical approach to learning was very effective.',
    images: [],
  },
  {
    rating: 4,
    content: 'Solid course with good content. The exercises were challenging but manageable.',
    images: [],
  },
  {
    rating: 5,
    content: 'I appreciated the real-world examples and case studies. Made the learning experience more engaging.',
    images: [],
  },
  {
    rating: 4,
    content:
      'The course structure was logical and the progression of topics made sense. Good for building foundational knowledge.',
    images: [],
  },
];

export const generateReviewResponse = (review: any) => {
  const responses = [
    "Thank you for your feedback! We're glad you found the course valuable.",
    'We appreciate your review and are happy to hear you enjoyed the course.',
    'Thank you for sharing your experience. Your feedback helps us improve our courses.',
    "We're pleased to hear you had a positive learning experience with us.",
    "Thank you for your detailed review. We're glad the course met your expectations.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
