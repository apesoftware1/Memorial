export const sendInquiryRest = async ({ name,mobileNumber, email, message = "", documentId }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
      const response = await fetch(`${baseUrl}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': Bearer ${token} if required
        },
        body: JSON.stringify({
          data: {
            name,
            mobileNumber,
            email,
            message,
            listings: {
              connect: [
                { documentId } // This works because your backend allows it
              ]
            }
          }
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error?.message || 'Failed to send inquiry');
      }
  
      return await response.json();
    } catch (err) {
      console.error('Inquiry submission failed:', err.message);
      throw err;
    }
  };
