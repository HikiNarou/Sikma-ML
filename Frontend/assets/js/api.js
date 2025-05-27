// SikmaV3 - assets/js/api.js (Diperbarui)

const API_BASE_URL = window.sikmaApp?.baseUrl
  ? `${window.sikmaApp.baseUrl}/auth.php`
  : "auth.php";
const FLASK_API_URL = "http://localhost:5001"; // Flask backend URL

/**
 * Generic fetch wrapper for API calls
 * @param {string} action - The action to perform (e.g., 'login', 'register')
 * @param {object} options - Fetch options (method, body, headers, signal)
 * @returns {Promise<object>} - Promise resolving to JSON response
 */
async function fetchAPI(action, options = {}) {
  const defaultOptions = {
    method: "POST",
    headers: {
      // 'Accept': 'application/json', // Backend selalu mengembalikan JSON
      // 'X-Requested-With': 'XMLHttpRequest' // Indikasi request AJAX
    },
    // signal: options.signal // Untuk AbortController jika diperlukan
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Tambahkan CSRF token ke FormData jika ada (perlu di-generate di backend dan disimpan di JS)
  // if (window.sikmaApp && window.sikmaApp.csrfToken && mergedOptions.body instanceof FormData) {
  //     mergedOptions.body.append('csrf_token', window.sikmaApp.csrfToken);
  // } else if (window.sikmaApp && window.sikmaApp.csrfToken && typeof mergedOptions.body === 'string') {
  //     const params = new URLSearchParams(mergedOptions.body);
  //     params.append('csrf_token', window.sikmaApp.csrfToken);
  //     mergedOptions.body = params.toString();
  // }

  // Automatically set Content-Type for FormData or URLSearchParams
  if (mergedOptions.body instanceof FormData) {
    // FormData sets its own Content-Type with boundary
    delete mergedOptions.headers["Content-Type"];
  } else if (
    typeof mergedOptions.body === "string" &&
    mergedOptions.headers["Content-Type"] === undefined
  ) {
    mergedOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (
    typeof mergedOptions.body === "object" &&
    !(mergedOptions.body instanceof FormData) &&
    mergedOptions.headers["Content-Type"] === undefined
  ) {
    // Jika body adalah objek plain dan bukan FormData, diasumsikan x-www-form-urlencoded
    // Backend saat ini tidak secara eksplisit menangani application/json
    const params = new URLSearchParams();
    for (const key in mergedOptions.body) {
      if (mergedOptions.body.hasOwnProperty(key)) {
        params.append(key, mergedOptions.body[key]);
      }
    }
    mergedOptions.body = params.toString();
    mergedOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  // Append action to FormData or URL string
  let requestUrl = API_BASE_URL;
  if (mergedOptions.method.toUpperCase() === "GET") {
    const params = new URLSearchParams(mergedOptions.body || {}); // Gunakan body untuk parameter GET jika ada
    params.append("action", action);
    requestUrl = `${API_BASE_URL}?${params.toString()}`;
    delete mergedOptions.body; // Tidak ada body untuk GET
  } else if (mergedOptions.body instanceof FormData) {
    mergedOptions.body.append("action", action);
  } else if (typeof mergedOptions.body === "string") {
    // URLSearchParams
    const params = new URLSearchParams(mergedOptions.body);
    params.append("action", action);
    mergedOptions.body = params.toString();
  }
  // Jika body adalah objek JSON (tidak digunakan saat ini oleh backend)
  // else if (typeof mergedOptions.body === 'object' && mergedOptions.headers['Content-Type'] === 'application/json') {
  //     mergedOptions.body.action = action;
  //     mergedOptions.body = JSON.stringify(mergedOptions.body);
  // }

  try {
    const response = await fetch(requestUrl, mergedOptions);

    // Coba parse JSON terlepas dari status response.ok untuk mendapatkan pesan error dari backend
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Jika parsing JSON gagal, dan response tidak ok, buat objek error standar
      if (!response.ok) {
        console.error(
          `HTTP error! Status: ${response.status}. Respons bukan JSON valid.`,
          await response.text().catch(() => "")
        );
        return {
          status: "error",
          message: `Kesalahan server (Status: ${response.status}). Respons tidak valid.`,
        };
      }
      // Jika response ok tapi JSON tidak valid (seharusnya tidak terjadi dengan backend yang benar)
      console.error("Respons JSON tidak valid meskipun status OK:", jsonError);
      return {
        status: "error",
        message: "Respons server tidak valid (format JSON salah).",
      };
    }

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`, data);
      // Gunakan pesan dari backend jika ada, jika tidak, buat pesan generik
      const message =
        data?.message ||
        `Kesalahan server (Status: ${response.status}). Silakan coba lagi.`;
      return {
        status: "error",
        message: message,
        errors: data?.errors,
        action: data?.action,
      }; // Sertakan detail errors jika ada
    }

    return data; // data sudah merupakan objek JSON
  } catch (error) {
    console.error("Fetch API Error:", error.name, error.message);
    let errorMessage =
      "Terjadi masalah jaringan. Periksa koneksi Anda dan coba lagi.";
    if (error.name === "AbortError") {
      errorMessage = "Permintaan dibatalkan.";
    }
    return { status: "error", message: errorMessage };
  }
}

const Api = {
  register: (formData) => fetchAPI("register", { body: formData }),
  login: (formData) => fetchAPI("login", { body: formData }),
  logout: () => fetchAPI("logout", { method: "POST", body: "action=logout" }), // Pastikan method POST
  checkSession: () =>
    fetchAPI("check_session", { method: "POST", body: "action=check_session" }),

  updateUserProfile: (formData) =>
    fetchAPI("update_profile", { body: formData }),
  changePassword: (formData) => fetchAPI("change_password", { body: formData }),
  forgotPassword: (email) =>
    fetchAPI("forgot_password", { body: { email: email } }), // Mengirim email sebagai objek
  // resetPassword: (formData) => fetchAPI('reset_password', { body: formData }), // Untuk submit password baru setelah reset

  saveFullProfileData: (profileDataPayload) => {
    const formData = new FormData();
    for (const key in profileDataPayload) {
      if (
        profileDataPayload.hasOwnProperty(key) &&
        profileDataPayload[key] !== undefined
      ) {
        if (key === "avatar" && profileDataPayload[key] instanceof File) {
          formData.append(
            key,
            profileDataPayload[key],
            profileDataPayload[key].name
          );
        } else {
          formData.append(key, profileDataPayload[key]);
        }
      }
    }
    return fetchAPI("save_full_profile", { body: formData });
  },

  getProfileData: () => fetchAPI("get_profile_data", { method: "GET" }),

  getRecommendations: async (userProfile) => {
    try {
      console.log("Fetching recommendations with profile:", userProfile);
      const response = await fetch(`${FLASK_API_URL}/recommendations`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: userProfile.skills || [],
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return {
        status: "error",
        message: "Failed to fetch recommendations",
      };
    }
  },

  getCompanyList: async (filters = {}) => {
    try {
      console.log("Fetching companies from:", `${FLASK_API_URL}/companies`);
      const response = await fetch(`${FLASK_API_URL}/companies`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.status === "success") {
        // If there are filters, apply them client-side
        let companies = data.companies;
        if (filters.category) {
          companies = companies.filter(
            (company) =>
              company.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }
        return {
          status: "success",
          companies: companies,
        };
      } else {
        return {
          status: "error",
          message: data.message || "Failed to fetch company list",
        };
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      return {
        status: "error",
        message: "Failed to connect to the server",
      };
    }
  },
  getCompanyDetails: (companyId) => {
    return fetchAPI("get_company_details", {
      method: "GET",
      body: { company_id: companyId },
    });
  },

  // Placeholder untuk API deaktivasi akun
  deactivateAccount: (password) =>
    fetchAPI("deactivate_account", { body: { current_password: password } }),
};

// export default Api; // Jika menggunakan ES6 modules
