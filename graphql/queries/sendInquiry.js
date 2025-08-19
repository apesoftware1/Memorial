export const sendInquiryRest = async ({ name, email, message, documentId }) => {
    try {
      const response = await fetch('https://typical-car-e0b66549b3.strapiapp.com/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': Bearer ${token} if required
        },
        body: JSON.stringify({
          data: {
            name,
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