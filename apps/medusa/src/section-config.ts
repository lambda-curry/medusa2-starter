export const sectionsConfig = [
  {
    name: 'Hero',
    description: 'A hero section that displays a title, description, and call to action button',
    contentFields: [
      {
        name: 'title',
        type: 'TextInput',
        required: true,
      },
      {
        name: 'description',
        type: 'TextArea',
        required: true,
      },
      {
        name: 'actions',
        type: 'ActionItem',
        required: true,
      },
    ],
  },
];
