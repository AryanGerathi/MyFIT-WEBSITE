export type Creator = {
  id: string;
  name: string;
  specialty: string;
  category: "Fat Loss" | "Muscle Gain" | "Yoga" | "Cardio" | "Strength";
  price: number;
  rating: number;
  reviews: number;
  experience: number;
  bio: string;
  image: string;
  verified: boolean;
  followers: number;
};

export type Review = {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
};

export type Booking = {
  id: string;
  creatorId: string;
  creatorName: string;
  date: string;
  time: string;
  price: number;
  status: "upcoming" | "completed";
};

export type Transaction = {
  id: string;
  user: string;
  creator: string;
  amount: number;
  commission: number;
  date: string;
  status: "success" | "pending" | "refunded";
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=600&h=600&fit=crop&crop=faces`;

export const creators: Creator[] = [
  {
    id: "1",
    name: "Arjun Mehta",
    specialty: "Strength & Muscle Gain",
    category: "Muscle Gain",
    price: 800,
    rating: 4.9,
    reviews: 142,
    experience: 6,
    bio: "Certified strength coach helping you build sustainable muscle with science-backed programming. Former national-level powerlifter.",
    image: img("1571019613454-1cb2f99b2d8b"),
    verified: true,
    followers: 12400,
  },
  {
    id: "2",
    name: "Priya Sharma",
    specialty: "Yoga & Flexibility",
    category: "Yoga",
    price: 500,
    rating: 4.8,
    reviews: 98,
    experience: 5,
    bio: "RYT-500 certified yoga instructor. Specializing in vinyasa flow, mobility, and stress relief practices for modern lifestyles.",
    image: img("1544367567-0f2fcb009e0b"),
    verified: true,
    followers: 8600,
  },
  {
    id: "3",
    name: "Rohan Iyer",
    specialty: "Fat Loss & HIIT",
    category: "Fat Loss",
    price: 600,
    rating: 4.7,
    reviews: 76,
    experience: 4,
    bio: "Helped 500+ clients lose fat sustainably with high-intensity training and habit coaching. Nutrition certified.",
    image: img("1583454110551-21f2fa2afe61"),
    verified: true,
    followers: 5400,
  },
  {
    id: "4",
    name: "Sneha Kapoor",
    specialty: "Cardio & Endurance",
    category: "Cardio",
    price: 450,
    rating: 4.9,
    reviews: 110,
    experience: 7,
    bio: "Marathon runner & endurance coach. Training plans for 5K to full marathon. Build cardiovascular strength that lasts.",
    image: img("1594381898411-846e7d193883"),
    verified: false,
    followers: 9800,
  },
  {
    id: "5",
    name: "Vikram Singh",
    specialty: "Powerlifting",
    category: "Strength",
    price: 1000,
    rating: 5.0,
    reviews: 64,
    experience: 9,
    bio: "Elite powerlifting coach. Squat, bench, deadlift specialist. Competition prep and form correction.",
    image: img("1567013127542-490d757e51fc"),
    verified: true,
    followers: 15200,
  },
  {
    id: "6",
    name: "Ananya Desai",
    specialty: "Pilates & Core",
    category: "Yoga",
    price: 550,
    rating: 4.6,
    reviews: 52,
    experience: 3,
    bio: "Mat & reformer pilates instructor focused on core strength, posture, and rehab-friendly movement.",
    image: img("1518310383802-640c2de311b2"),
    verified: false,
    followers: 3200,
  },
  {
    id: "7",
    name: "Karan Verma",
    specialty: "CrossFit & Conditioning",
    category: "Fat Loss",
    price: 750,
    rating: 4.8,
    reviews: 88,
    experience: 5,
    bio: "CrossFit Level 2 trainer. Functional fitness, conditioning, and Olympic lifting fundamentals.",
    image: img("1534438327276-14e5300c3a48"),
    verified: true,
    followers: 7100,
  },
  {
    id: "8",
    name: "Meera Nair",
    specialty: "Postnatal Fitness",
    category: "Strength",
    price: 700,
    rating: 4.9,
    reviews: 41,
    experience: 6,
    bio: "Specialized in postnatal recovery, diastasis recti, and rebuilding strength safely after pregnancy.",
    image: img("1548690312-e3b507d8c110"),
    verified: true,
    followers: 4500,
  },
];

export const reviews: Review[] = [
  { id: "r1", user: "Riya P.", rating: 5, comment: "Transformed my form completely. Worth every rupee!", date: "2 weeks ago" },
  { id: "r2", user: "Amit K.", rating: 5, comment: "Best coach I've worked with. Patient and knowledgeable.", date: "1 month ago" },
  { id: "r3", user: "Neha S.", rating: 4, comment: "Great sessions, very motivating. Lost 6kg in 3 months.", date: "2 months ago" },
  { id: "r4", user: "Sahil M.", rating: 5, comment: "Highly recommend. Custom plans that actually work.", date: "3 months ago" },
];

export const testimonials = [
  { name: "Aditi R.", role: "Lost 8kg in 4 months", quote: "MyFit connected me with the perfect coach. The 1-on-1 attention made all the difference.", image: img("1438761681033-6461ffad8d80") },
  { name: "Karthik V.", role: "Gained 6kg muscle", quote: "Booking sessions is seamless. My trainer customizes every workout to my goals.", image: img("1500648767791-00dcc994a43e") },
  { name: "Pooja S.", role: "Marathon finisher", quote: "From couch to 42K in 9 months. Couldn't have done it without my MyFit coach.", image: img("1494790108377-be9c29b29330") },
];

export const userBookings: Booking[] = [
  { id: "b1", creatorId: "1", creatorName: "Arjun Mehta", date: "2025-04-20", time: "07:00 AM", price: 800, status: "upcoming" },
  { id: "b2", creatorId: "2", creatorName: "Priya Sharma", date: "2025-04-22", time: "06:30 PM", price: 500, status: "upcoming" },
  { id: "b3", creatorId: "3", creatorName: "Rohan Iyer", date: "2025-04-10", time: "08:00 AM", price: 600, status: "completed" },
  { id: "b4", creatorId: "5", creatorName: "Vikram Singh", date: "2025-04-02", time: "07:00 PM", price: 1000, status: "completed" },
];

export const creatorBookings: Booking[] = [
  { id: "cb1", creatorId: "self", creatorName: "Riya P.", date: "2025-04-19", time: "07:00 AM", price: 800, status: "upcoming" },
  { id: "cb2", creatorId: "self", creatorName: "Amit K.", date: "2025-04-19", time: "09:00 AM", price: 800, status: "upcoming" },
  { id: "cb3", creatorId: "self", creatorName: "Neha S.", date: "2025-04-20", time: "06:30 PM", price: 800, status: "upcoming" },
  { id: "cb4", creatorId: "self", creatorName: "Sahil M.", date: "2025-04-08", time: "07:00 AM", price: 800, status: "completed" },
];

export const transactions: Transaction[] = [
  { id: "t1", user: "Riya P.", creator: "Arjun Mehta", amount: 800, commission: 80, date: "2025-04-15", status: "success" },
  { id: "t2", user: "Amit K.", creator: "Priya Sharma", amount: 500, commission: 50, date: "2025-04-14", status: "success" },
  { id: "t3", user: "Neha S.", creator: "Rohan Iyer", amount: 600, commission: 60, date: "2025-04-13", status: "pending" },
  { id: "t4", user: "Sahil M.", creator: "Vikram Singh", amount: 1000, commission: 100, date: "2025-04-12", status: "success" },
  { id: "t5", user: "Pooja G.", creator: "Sneha Kapoor", amount: 450, commission: 45, date: "2025-04-11", status: "refunded" },
];

export const timeSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

export const revenueData = [
  { month: "Nov", revenue: 42000 },
  { month: "Dec", revenue: 58000 },
  { month: "Jan", revenue: 71000 },
  { month: "Feb", revenue: 65000 },
  { month: "Mar", revenue: 89000 },
  { month: "Apr", revenue: 104000 },
];

export const adminUsers = [
  { id: "u1", name: "Riya Patel", email: "riya@example.com", joined: "2025-03-12", bookings: 8 },
  { id: "u2", name: "Amit Kumar", email: "amit@example.com", joined: "2025-02-28", bookings: 12 },
  { id: "u3", name: "Neha Singh", email: "neha@example.com", joined: "2025-04-01", bookings: 3 },
  { id: "u4", name: "Sahil Mehta", email: "sahil@example.com", joined: "2025-01-18", bookings: 21 },
];

export const pendingCreators = [
  { id: "pc1", name: "Rahul Joshi", specialty: "Boxing", experience: 4, applied: "2025-04-14" },
  { id: "pc2", name: "Divya Rao", specialty: "Zumba", experience: 6, applied: "2025-04-13" },
  { id: "pc3", name: "Aakash Patil", specialty: "Calisthenics", experience: 3, applied: "2025-04-12" },
];
