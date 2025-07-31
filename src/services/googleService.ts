// Tạo service mới để xử lý Google API
export const getGoogleAvatar = async (accessToken: string) => {
  try {
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=photos',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const data = await response.json();
    return data.photos?.[0]?.url;
  } catch (error) {
    console.error('Error fetching Google avatar:', error);
    return null;
  }
}; 