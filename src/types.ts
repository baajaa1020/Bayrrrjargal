export interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar: string;
}

export interface Service {
  id: number;
  iconName: string;
  title: string;
  description: string;
  tag: string;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}
