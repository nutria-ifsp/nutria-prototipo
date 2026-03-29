export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  CreatePost: undefined;
  GoalSelection: undefined;
  CaloricData: undefined;
  Welcome: { username: string; tdee: number; target: number; goal: string };
  MainTabs: undefined;
  Premium: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Grupos: undefined;
  Perfil: undefined;
};

export type ProfileData = {
  name: string;
  username: string;
  bio: string;
  image: string;
};

export type PerfilStackParamList = {
  PerfilMain: undefined;
  EditarPerfil: undefined;
  Configuracoes: undefined;
};