export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
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