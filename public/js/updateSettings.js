import axios from 'axios';
import { showAlert } from '../js/alert';

export const updatedUserData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'api/v1/users/updatePassword'
        : 'api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully !`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
