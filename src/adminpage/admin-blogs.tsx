import "./css/admin-blogs.css";
import { FaSearch, FaBell, FaPlus } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import select from "../assets/adminpage/blogs/select.png";
import { useState, useEffect, useRef } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaImage,
  FaListUl,
  FaUndo,
  FaRedo,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

interface Blog {
  blog_id: string;
  title: string;
  category: string;
  author: string;
  blog_status: string;
  created_at: string;
  content: string;
  image_url: string;
  more_images?: string[];
}

const AdminBlogs = () => {
  const [count, setCount] = useState(-1);
  const [open, setOpen] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [openCreatedAt, setOpenCreatedAt] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [createdSortOrder, setCreatedSortOrder] = useState("Newest First");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [newBlogModalOpen, setNewBlogModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableBlog, setEditableBlog] = useState<Blog | null>(null);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogCategory, setNewBlogCategory] = useState("KALUSUGAN");
  const [newBlogStatus, setNewBlogStatus] = useState("DRAFT");
  const [newBlogAuthor, setNewBlogAuthor] = useState("users-2025-000001");
  const [newBlogAuthorName, setNewBlogAuthorName] = useState("");
  const [bulkConfirmVisible, setBulkConfirmVisible] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<
    "delete" | "status" | null
  >(null);
  const [bulkActionStatus, setBulkActionStatus] = useState<string>("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [oldPassword, setOldPassword] = useState("");

  const handleSendOTP = async () => {
    if (!profileEmail) {
      toast.error("Email not found.");
      return;
    }

    if (!profilePhone && !profilePassword) {
      toast.error("At least one of phone or password must be provided.");
      return;
    }

    if (profilePassword) {
      if (!oldPassword) {
        toast.error("Please enter your current password.");
        return;
      }

      try {
        const verifyRes = await fetch(
          "http://localhost/tara-kabataan/tara-kabataan-backend/api/verify_old_password.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profileEmail,
              old_password: oldPassword,
            }),
          }
        );

        const verifyData = await verifyRes.json();
        if (!verifyData.valid) {
          toast.error("Old password is incorrect.");
          return;
        }
      } catch (err) {
        toast.error("Failed to verify old password.");
        return;
      }

      if (profilePassword.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }

      const strongPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).+$/;
      if (!strongPattern.test(profilePassword)) {
        toast.error("Password must include letters, numbers, and symbols.");
        return;
      }

      const emailParts = profileEmail.split(/[@._\-]/).filter(Boolean);
      const passwordLower = profilePassword.toLowerCase();
      for (const part of emailParts) {
        if (part && passwordLower.includes(part.toLowerCase())) {
          toast.error("Password should not include parts of your email.");
          return;
        }
      }

      try {
        const prevRes = await fetch(
          "http://localhost/tara-kabataan/tara-kabataan-backend/api/check_previous_password.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profileEmail,
              new_password: profilePassword,
            }),
          }
        );
        const prevData = await prevRes.json();
        if (prevData.same === true) {
          toast.error(
            "New password must be different from the previous password."
          );
          return;
        }
      } catch {
        toast.error("Failed to check previous password.");
        return;
      }
    }

    const toastId = toast.loading("Sending OTP...");

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/send_otp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profileEmail }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        toast.update(toastId, {
          render: (
            <div>
              <strong>OTP sent to your email.</strong>
              <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                Check spam folder if not found.
              </div>
            </div>
          ),
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to send OTP.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: "Error sending OTP.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err);
    }
  };

  const handleVerifyOTP = async () => {
    const toastId = toast.loading("Verifying OTP...");

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/verify_otp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profileEmail, otp: otpInput }),
        }
      );

      const data = await res.json();

      if (data.success) {
        await handleProfileUpdate();
        setOtpSent(false);
        setOtpInput("");
        setIsEditingProfile(false);
        toast.update(toastId, {
          render: "OTP verified. Profile updated.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Incorrect OTP.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: "Error verifying OTP.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profilePhone && !profilePassword) {
      toast.error("At least one of phone or password must be provided.");
      return;
    }

    if (profilePassword) {
      if (profilePassword.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }

      const strongPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).+$/;
      if (!strongPattern.test(profilePassword)) {
        toast.error("Password must include letters, numbers, and symbols.");
        return;
      }

      const emailParts = profileEmail.split(/[@._\-]/).filter(Boolean);
      const passwordLower = profilePassword.toLowerCase();
      for (const part of emailParts) {
        if (part && passwordLower.includes(part.toLowerCase())) {
          toast.error("Password should not include parts of your email.");
          return;
        }
      }

      try {
        const prevRes = await fetch(
          "http://localhost/tara-kabataan/tara-kabataan-backend/api/check_previous_password.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profileEmail,
              new_password: profilePassword,
            }),
          }
        );
        const prevData = await prevRes.json();
        if (prevData.same === true) {
          toast.error(
            "New password must be different from the previous password."
          );
          return;
        }
      } catch {
        toast.error("Failed to check previous password.");
        return;
      }
    }

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/update_profile.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: loggedInUser?.user_id,
            email: profileEmail,
            phone: profilePhone,
            password: profilePassword,
          }),
        }
      );

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (data.success) {
          toast.success("Profile updated!");
          setLoggedInUser(data.user);
          localStorage.setItem("admin-user", JSON.stringify(data.user));
          setShowProfileModal(false);
        } else {
          toast.error(data.message || "Failed to update profile.");
        }
      } catch (err) {
        console.error("Invalid JSON from update_profile.php:", text);
        toast.error("Invalid server response.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Server error.");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("admin-user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setLoggedInUser(parsed);
      } catch {
        console.error("Failed to parse stored user");
      }
    }
  }, []);

  useEffect(() => {
    if (showProfileModal && loggedInUser) {
      setProfileEmail(loggedInUser.user_email || "");
      setProfilePhone(loggedInUser.user_contact || "");
      setProfilePassword("");
    }
  }, [showProfileModal, loggedInUser]);

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredBlogs = blogs
    .filter((blog) => {
      const matchCategory =
        selectedCategory === "All" ||
        blog.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchStatus =
        selectedStatus === "All" ||
        blog.blog_status.toLowerCase() === selectedStatus.toLowerCase();

      const searchLower = searchQuery.toLowerCase();

      const matchSearch =
        (blog.blog_id?.toLowerCase().includes(searchLower) ?? false) ||
        (blog.title?.toLowerCase().includes(searchLower) ?? false) ||
        (blog.category?.toLowerCase().includes(searchLower) ?? false) ||
        (blog.author?.toLowerCase().includes(searchLower) ?? false) ||
        (blog.blog_status?.toLowerCase().includes(searchLower) ?? false) ||
        (formatDate(blog.created_at).toLowerCase().includes(searchLower) ??
          false) ||
        (blog.blog_id?.toLowerCase().includes(searchLower) ?? false);

      return matchCategory && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const isPinnedA = a.blog_status.toLowerCase() === "pinned";
      const isPinnedB = b.blog_status.toLowerCase() === "pinned";

      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;

      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return createdSortOrder === "Newest First"
        ? dateB - dateA
        : dateA - dateB;
    })
    .slice(0, count === -1 ? blogs.length : count);

  const handleEdit = () => {
    setSubmittedEdit(false);
    setEditableBlog({ ...selectedBlog! });
    setInitialStatus(selectedBlog!.blog_status);
    setEditableBlogMoreImages(selectedBlog?.more_images || []);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSubmittedEdit(false);
    setIsEditing(false);
    setEditableBlog(null);
  };

  const [submittedEdit, setSubmittedEdit] = useState(false);

  const handleSave = () => {
    setSubmittedEdit(true);
    const updatedContent = textareaRef.current?.innerHTML ?? "";
    const stripped = updatedContent.replace(/<[^>]+>/g, "").trim();

    setEditableBlog((prev) =>
      prev ? { ...prev, content: updatedContent } : prev
    );

    if (
      !editableBlog?.title?.trim() ||
      !editableBlog?.image_url ||
      !editableBlog?.content?.trim() ||
      !stripped
    ) {
      setNotification("Please fill out all required fields marked with *");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    if (textareaRef.current) {
      const updatedContent = textareaRef.current.innerHTML;
      if (editableBlog) {
        editableBlog.content = updatedContent;
      }
    }

    const mergedBlog = {
      ...editableBlog!,
      more_images: editableBlogMoreImages,
    };

    fetch(
      "http://localhost/tara-kabataan/tara-kabataan-backend/api/update_blogs.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedBlog),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlogs((prev) =>
            prev.map((b) => (b.blog_id === mergedBlog.blog_id ? mergedBlog : b))
          );
          setSelectedBlog(mergedBlog);
          setIsEditing(false);
          setNotificationType("success");
          setNotification("Blog updated successfully!");
          setTimeout(() => setNotification(""), 4000);
          setSubmittedEdit(false);
        } else {
          setNotification("Failed to update blog.");
          setTimeout(() => setNotification(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Failed to update:", err);
        setNotification("Error occurred while updating blog.");
        setTimeout(() => setNotification(""), 4000);
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editableBlog) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_blog_image.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success && data.image_url) {
        setEditableBlog({ ...editableBlog, image_url: data.image_url });
      } else {
        alert("Image upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }
  };

  const handleImageRemove = () => {
    if (!editableBlog) return;
    setEditableBlog({ ...editableBlog, image_url: "" });
  };

  const confirmDeleteBlog = () => {
    if (!selectedBlog) return;

    fetch(
      "http://localhost/tara-kabataan/tara-kabataan-backend/api/delete_blogs.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blog_id: selectedBlog.blog_id }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlogs((prev) =>
            prev.filter((b) => b.blog_id !== selectedBlog.blog_id)
          );
          setNotification("Blog deleted successfully!");

          setTimeout(() => {
            setNotification("");
            setSelectedBlog(null);
          }, 2500);
        } else {
          setNotification("Failed to delete blog.");
          setTimeout(() => setNotification(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setNotification("Error occurred while deleting blog.");
        setTimeout(() => setNotification(""), 4000);
      });

    setConfirmDeleteVisible(false);
  };

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editableBlog) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_blog_image.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success && data.image_url) {
        const imageTag = `<img src="http://localhost${data.image_url}" alt="inserted image" style="max-width:100%;" />`;
        setEditableBlog((prev) =>
          prev
            ? { ...prev, content: (prev.content || "") + `\n${imageTag}\n` }
            : prev
        );
      } else {
        alert("Failed to upload image to content.");
      }
    } catch (err) {
      console.error("Content image upload error:", err);
      alert("Error occurred while uploading image to content.");
    }
  };

  const textareaRef = useRef<HTMLDivElement>(null);

  const applyFormatting = (command: "bold" | "italic" | "underline") => {
    document.execCommand(command, false);
  };

  const selectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      selectionRef.current = sel.getRangeAt(0);
    }
  };

  const applyList = () => {
    restoreSelection();
    document.execCommand("insertUnorderedList", false);
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (selectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(selectionRef.current);
    }
  };

  const resetNewBlogForm = () => {
    setNewBlogTitle("");
    setNewBlogContent("");
    setNewBlogCategory("KALUSUGAN");
    setNewBlogStatus("DRAFT");
    setNewBlogImage("");
  };

  const getAuthorNameById = (authorId: string) => {
    const authors: { [key: string]: string } = {
      "users-2025-000001": "Yugi Revaula",
    };
    return authors[authorId] || authorId;
  };

  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  const applyBulkStatus = async (newStatus: string) => {
    if (newStatus === "PINNED") {
      const alreadyPinnedCount = blogs.filter(
        (blog) => blog.blog_status === "PINNED"
      ).length;
      const tryingToPinCount = selectedBlogIds.length;
      if (alreadyPinnedCount + tryingToPinCount > 3) {
        setNotification(
          "You can only pin up to 3 blogs. Please unpin one first."
        );
        setNotificationType("error");
        setTimeout(() => setNotification(""), 4000);
        return;
      }
    }

    try {
      const response = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/update_bulk_blog_status.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blog_ids: selectedBlogIds,
            new_status: newStatus,
            more_images: editableBlogMoreImages,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setBlogs((prev) =>
          prev.map((blog) =>
            selectedBlogIds.includes(blog.blog_id)
              ? { ...blog, blog_status: newStatus }
              : blog
          )
        );
        setSelectedBlogIds([]);
        setSelectMode(false);
        setNotification(`Successfully updated blogs to ${newStatus}!`);
        setNotificationType("success");
        setTimeout(() => setNotification(""), 4000);
      } else {
        setNotification("Failed to update blog status.");
        setNotificationType("error");
        setTimeout(() => setNotification(""), 4000);
      }
    } catch (err) {
      console.error("Bulk status update error:", err);
      setNotification("Error occurred during bulk status update.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/delete_bulk_blogs.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blog_ids: selectedBlogIds }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setBlogs((prev) =>
          prev.filter((blog) => !selectedBlogIds.includes(blog.blog_id))
        );
        setSelectedBlogIds([]);
        setSelectMode(false);
      } else {
        alert("Failed to delete blogs.");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Error occurred during bulk delete.");
    }
  };

  useEffect(() => {
    fetch(
      `http://localhost/tara-kabataan/tara-kabataan-backend/api/get_user_name.php?user_id=${newBlogAuthor}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.user_name) {
          setNewBlogAuthorName(data.user_name);
        }
      })
      .catch((err) => console.error("Failed to fetch user name:", err));
  }, [newBlogAuthor]);

  useEffect(() => {
    fetch("http://localhost/tara-kabataan/tara-kabataan-backend/api/blogs.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs && Array.isArray(data.blogs)) {
          const processed = data.blogs.map((b) => ({
            ...b,
            more_images: b.more_images ?? [],
          }));
          setBlogs(processed);
        }
      })
      .catch((err) => console.error("Failed to fetch blogs:", err));
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current && editableBlog?.content) {
      textareaRef.current.innerHTML = editableBlog.content;
    }
  }, [isEditing, editableBlog]);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [newBlogContent, setNewBlogContent] = useState("");
  const [newBlogImage, setNewBlogImage] = useState("");

  const handleNewBlogImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/add_new_blog_image.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (data.success && data.image_url) {
          setNewBlogImage(data.image_url);
        } else {
          alert("Image upload failed: " + (data.error || "Unknown error."));
        }
      } catch (err) {
        console.error("Failed to parse JSON response:", text);
        alert("Invalid server response. Check PHP file for unexpected output.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during image upload.");
    }
  };

  const [submitted, setSubmitted] = useState(false);

  const handleNewBlogSave = async () => {
    setSubmitted(true);

    if (!newBlogTitle.trim() || !newBlogContent.trim() || !newBlogImage) {
      setNotification("Please fill out all required fields marked with *");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    const blogData = {
      title: newBlogTitle,
      content: newBlogContent,
      category: newBlogCategory,
      blog_status: newBlogStatus,
      image_url: newBlogImage,
      author: newBlogAuthor,
      more_images: newBlogMoreImages,
    };

    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/add_new_blog.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        }
      );
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.success && data.blog) {
        setBlogs((prev) => [...prev, data.blog]);

        const fresh = await fetch(
          "http://localhost/tara-kabataan/tara-kabataan-backend/api/blogs.php"
        ).then((r) => r.json());
        setBlogs(fresh.blogs);

        resetNewBlogForm();
        setNewBlogMoreImages([]);
        setShowAllImagesModal(false);
        setNewBlogModalOpen(false);
      } else {
        alert("Failed to save new blog: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error occurred while saving blog.");
    }
  };

  const pinnedBlogs = blogs.filter((blog) => blog.blog_status === "PINNED");
  const pinnedCount = pinnedBlogs.length;

  const togglePinBlog = (blogId: string, currentPinned: boolean) => {
    if (!currentPinned && pinnedCount >= 3) {
      setNotification(
        "You can only pin up to 3 blogs. Please unpin one first."
      );
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    fetch(
      "http://localhost/tara-kabataan/tara-kabataan-backend/api/update_blog_pin_status.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blog_id: blogId,
          is_pinned: currentPinned ? 0 : 1,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlogs((prev) =>
            prev.map((blog) =>
              blog.blog_id === blogId
                ? { ...blog, is_pinned: currentPinned ? 0 : 1 }
                : blog
            )
          );
          setNotification(currentPinned ? "Blog unpinned." : "Blog pinned!");
          setTimeout(() => setNotification(""), 4000);
        } else {
          setNotification("Failed to update pin status.");
          setTimeout(() => setNotification(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Pin error:", err);
        setNotification("An error occurred while pinning.");
      });
  };

  const [newBlogMoreImages, setNewBlogMoreImages] = useState<string[]>([]);
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const [editableBlogMoreImages, setEditableBlogMoreImages] = useState<
    string[]
  >([]);

  const imageList = isEditing
    ? editableBlogMoreImages
    : newBlogModalOpen
      ? newBlogMoreImages
      : selectedBlog?.more_images || [];

  const [confirmThumbDeleteIndex, setConfirmThumbDeleteIndex] = useState<
    number | null
  >(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const rawText = textareaRef.current?.innerText.trim() ?? "";

  const editStatusOptions = () => {
    if (initialStatus === "DRAFT") {
      return ["DRAFT", "PUBLISHED"];
    } else {
      return ["PUBLISHED", "PINNED", "ARCHIVED"];
    }
  };

  const [initialStatus, setInitialStatus] = useState<string>("");

  return (
    <div className="admin-blogs">
      <div className="admin-blogs-header">
        <div className="admin-blogs-search-container">
          <FaSearch className="admin-blogs-search-icon" />
          <input
            type="text"
            name="fakeusernameremembered"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="fakepasswordremembered"
            style={{ display: "none" }}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            name="search-blog"
            id="search-blog"
          />
        </div>
        <div className="admin-blogs-header-right">
          <div
            className="admin-blogs-userinfo"
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: "pointer" }}
          >
            <div className="userinfo-label">Logged in as:</div>
            <div className="userinfo-details">
              <p className="userinfo-name">
                {loggedInUser?.user_name || "Admin"}
              </p>
              <p className="userinfo-email">{loggedInUser?.user_email || ""}</p>
            </div>
          </div>
          {showProfileModal && (
            <div className="admin-profile-modal">
              <div className="admin-profile-modal-box">
                <div
                  className="modal-close-icon"
                  onClick={() => {
                    setShowProfileModal(false);
                    setIsEditingProfile(false);
                    setOtpSent(false);
                    setOtpInput("");
                    setProfilePhone(loggedInUser?.user_contact || "");
                    setProfilePassword("");
                    setOldPassword("");
                  }}
                >
                  <FaTimes />
                </div>
                <h2>Change Password</h2>
                <label>Email:</label>
                <input type="email" value={profileEmail} disabled />
                {isEditingProfile && (
                  <>
                    <label>Phone:</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      disabled={!isEditingProfile}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />

                    <div style={{ position: "relative" }}>
                      <label>Old Password:</label>
                      <input
                        type="text"
                        name="fakeusernameremembered"
                        style={{ display: "none" }}
                      />
                      <input
                        type="password"
                        name="fakepasswordremembered"
                        style={{ display: "none" }}
                      />
                      <form autoComplete="off">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          style={{ width: "100%" }}
                          required
                        />
                      </form>

                      <label>New Password:</label>
                      <input
                        type="text"
                        name="fakeusernameremembered"
                        style={{ display: "none" }}
                      />
                      <input
                        type="password"
                        name="fakepasswordremembered"
                        style={{ display: "none" }}
                      />
                      <form autoComplete="off">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a New Password"
                          autoComplete="new-password"
                          value={profilePassword}
                          readOnly={!isEditingProfile}
                          onChange={(e) => setProfilePassword(e.target.value)}
                          style={{
                            width: "100%",
                            color: !isEditingProfile ? "#999" : "inherit",
                            cursor: !isEditingProfile ? "default" : "text",
                          }}
                        />
                      </form>
                    </div>
                  </>
                )}
                <div className="admin-profile-buttons">
                  {!isEditingProfile ? (
                    <button onClick={() => setIsEditingProfile(true)}>
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          handleSendOTP();
                          setOtpRequired(true);
                        }}
                      >
                        Send OTP
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setOtpSent(false);
                          setOtpInput("");
                          setProfilePhone(loggedInUser?.user_contact || "");
                          setProfilePassword("");
                          setOldPassword("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                {otpSent && (
                  <div className="otp-verification">
                    <label>Enter 6-digit OTP:</label>
                    <div className="otp-inputs">
                      {Array(6)
                        .fill("")
                        .map((_, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            className="otp-box"
                            value={otpInput[index] || ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              if (!val) return;
                              const updated = [...otpInput];
                              updated[index] = val[0];
                              setOtpInput(updated.join(""));
                              if (index < 5 && val) {
                                otpRefs.current[index + 1]?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace") {
                                const updated = [...otpInput];
                                if (otpInput[index]) {
                                  updated[index] = "";
                                  setOtpInput(updated.join(""));
                                } else if (index > 0) {
                                  otpRefs.current[index - 1]?.focus();
                                }
                              }
                            }}
                          />
                        ))}
                    </div>
                    <button onClick={handleVerifyOTP}>Verify OTP & Save</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {notification && (
          <div
            className={`blogs-notification-message ${notificationType} show`}
          >
            {notification}
          </div>
        )}
      </div>
      <div className="admin-blogs-lower-header">
        <h1>Blogs</h1>
        <div className="admin-blogs-lower-header-right">
          {viewMode === "table" ? (
            <>
              {/* <div className="admin-blogs-lower-header-show">
            <p>Showing</p>
            <div className="admin-blogs-lower-header-count" onClick={() => setOpen(!open)}>
              {count === -1 ? 'All' : count}
              <span className="dropdown-arrow">▾</span>
              {open && (
                <div className="admin-blogs-dropdown-menu">
                  {[-1, ...Array.from({ length: 20 }, (_, i) => i + 1)].map((val) => (
                    <div
                      key={val}
                      className="admin-blogs-dropdown-item"
                      onClick={() => {
                        setCount(val);
                        setOpen(false);
                      }}
                    >
                      {val === -1 ? 'All' : val}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}
              <div className="admin-blogs-lower-header-select">
                <button onClick={() => setSelectMode(!selectMode)}>
                  <img
                    src={select}
                    className="admin-blogs-lower-header-select-img"
                  />
                  {selectMode ? "Cancel" : "Select"}
                </button>
              </div>
            </>
          ) : (
            <div className="admin-blogs-lower-header-show">
              <p>Category</p>
              <div
                className="admin-blogs-lower-header-category"
                onClick={() => setOpenCategory(!openCategory)}
              >
                {selectedCategory}
                <span className="dropdown-arrow">▾</span>
                {openCategory && (
                  <div className="admin-blogs-dropdown-menu">
                    {[
                      "All",
                      "Kalusugan",
                      "Kalikasan",
                      "Karunungan",
                      "Kultura",
                      "Kasarian",
                    ].map((cat) => (
                      <div
                        key={cat}
                        className="admin-blogs-dropdown-item"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenCategory(false);
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="admin-blogs-toggle-wrapper">
            <button
              className={`admin-blogs-toggle-button ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
            <button
              className={`admin-blogs-toggle-button ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Grid View
            </button>
          </div>
          <div className="admin-blogs-lower-header-new-blog">
            <button
              onClick={() => {
                resetNewBlogForm();
                setNewBlogMoreImages([]);
                setNewBlogImage("");
                setNewBlogContent("");
                setShowAllImagesModal(false);
                setNewBlogModalOpen(true);
              }}
            >
              <FaPlus className="admin-icon-left" />
              Add New Blog
            </button>
          </div>
        </div>
      </div>
      {selectMode && (
        <div className="admin-blogs-bulk-actions">
          {["DRAFT", "PUBLISHED", "PINNED", "ARCHIVED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setBulkActionType("status");
                setBulkActionStatus(status);
                setBulkConfirmVisible(true);
              }}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => {
              setBulkActionType("delete");
              setBulkConfirmVisible(true);
            }}
          >
            DELETE
          </button>
        </div>
      )}
      <div className="admin-blogs-main-content">
        {viewMode === "table" ? (
          <div className="admin-blogs-scrollable-table">
            <table className="admin-blogs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    <div
                      className="admin-blogs-dropdown-trigger"
                      onClick={() => setOpenCategory(!openCategory)}
                    >
                      Category{" "}
                      <span className="admin-header-dropdown-arrow">▾</span>
                      {openCategory && (
                        <div className="admin-header-dropdown-menu">
                          {[
                            "All",
                            "Kalusugan",
                            "Kalikasan",
                            "Karunungan",
                            "Kultura",
                            "Kasarian",
                          ].map((item) => (
                            <div
                              key={item}
                              className="admin-header-dropdown-item"
                              onClick={() => {
                                setSelectedCategory(item);
                                setOpenCategory(false);
                              }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Blog Title</th>
                  <th>Author</th>
                  <th>
                    <div
                      className="admin-blogs-dropdown-trigger"
                      onClick={() => setOpenStatus(!openStatus)}
                    >
                      Status{" "}
                      <span className="admin-header-dropdown-arrow">▾</span>
                      {openStatus && (
                        <div className="admin-header-dropdown-menu">
                          {[
                            "All",
                            "Draft",
                            "Published",
                            "Pinned",
                            "Archived",
                          ].map((status) => (
                            <div
                              key={status}
                              className="admin-header-dropdown-item"
                              onClick={() => {
                                setSelectedStatus(status);
                                setOpenStatus(false);
                              }}
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div
                      className="admin-blogs-dropdown-trigger"
                      onClick={() => setOpenCreatedAt(!openCreatedAt)}
                    >
                      Created At{" "}
                      <span className="admin-header-dropdown-arrow">▾</span>
                      {openCreatedAt && (
                        <div className="admin-header-dropdown-menu">
                          {["Newest First", "Oldest First"].map((order) => (
                            <div
                              key={order}
                              className="admin-header-dropdown-item"
                              onClick={() => {
                                setCreatedSortOrder(order);
                                setOpenCreatedAt(false);
                              }}
                            >
                              {order}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                  <th>{selectMode ? "Select" : "View"}</th>
                </tr>
              </thead>
              <colgroup>
                <col style={{ width: "80px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "40px" }} />
              </colgroup>
              <tbody>
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <tr
                      className="admin-blogs-table-content"
                      key={blog.blog_id}
                    >
                      <td className="admin-blogs-id-content">{blog.blog_id}</td>
                      <td className="admin-blogs-category-content category-tag">
                        {blog.category}
                      </td>
                      <td className="admin-blogs-title-content">
                        {blog.title}
                      </td>
                      <td className="admin-blogs-author-content">
                        {blog.author}
                      </td>
                      <td
                        className={`admin-blogs-status-content status-${blog.blog_status.toLowerCase()}`}
                      >
                        {blog.blog_status}
                      </td>
                      <td className="admin-blogs-created-at-content">
                        {formatDate(blog.created_at)}
                      </td>
                      <td className="admin-blogs-more-button">
                        {selectMode ? (
                          <input
                            type="checkbox"
                            checked={selectedBlogIds.includes(blog.blog_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBlogIds((prev) => [
                                  ...prev,
                                  blog.blog_id,
                                ]);
                              } else {
                                setSelectedBlogIds((prev) =>
                                  prev.filter((id) => id !== blog.blog_id)
                                );
                              }
                            }}
                          />
                        ) : (
                          <button onClick={() => setSelectedBlog(blog)}>
                            <BsThreeDots />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="admin-blogs-table-content no-blogs-row">
                    <td colSpan={7} className="no-blogs-message">
                      No Blog Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-blogs-grid-view">
            {filteredBlogs.length > 0 ? (
              <div className="blog-grid-scrollable-wrapper">
                <div className="blog-grid-container">
                  {filteredBlogs.map((blog) => (
                    <div
                      key={blog.blog_id}
                      className={`blog-grid-card grid-status-${blog.blog_status.toLowerCase()}`}
                      onClick={() => setSelectedBlog(blog)}
                    >
                      <img
                        src={`http://localhost${blog.image_url}`}
                        alt={blog.title}
                        className="blog-grid-image"
                      />
                      <div className="blog-grid-overlay">
                        <h3 className="blog-overlay-title">{blog.title}</h3>
                        <p className="blog-overlay-category">{blog.category}</p>
                        <p className="blog-overlay-date">
                          {formatDate(blog.created_at)}
                        </p>
                        <p className="blog-overlay-author">
                          {getAuthorNameById(blog.author)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ marginTop: "20px" }}>No blogs found.</p>
            )}
          </div>
        )}
      </div>
      {selectedBlog && (
        <div className="admin-blogs-view-more">
          <div className="admin-blogs-modal">
            <div className="admin-blogs-modal-content">
              <div className="admin-blogs-float-buttons">
                {isEditing ? (
                  <>
                    <button className="save-btn" onClick={handleSave}>
                      Save
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={handleEdit}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                )}
              </div>
              <button
                className="admin-blogs-modal-close"
                onClick={() => {
                  if (isEditing) {
                    handleCancel();
                  }
                  setSelectedBlog(null);
                }}
              >
                ✕
              </button>
              <div className="admin-blogs-modal-inner-content">
                {notification && (
                  <div
                    className={`blogs-notification-message ${notification.includes("successfully") ? "success" : "error"} show`}
                  >
                    {notification}
                  </div>
                )}
                {confirmDeleteVisible && (
                  <div className="blogs-confirmation-popup show">
                    <p>Are you sure you want to delete this blog?</p>
                    <div className="blogs-confirmation-actions">
                      <button
                        className="confirm-yes"
                        onClick={() => {
                          fetch(
                            "http://localhost/tara-kabataan/tara-kabataan-backend/api/delete_blogs.php",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                blog_id: selectedBlog?.blog_id,
                              }),
                            }
                          )
                            .then((res) => res.json())
                            .then((data) => {
                              if (data.success) {
                                setBlogs((prev) =>
                                  prev.filter(
                                    (b) => b.blog_id !== selectedBlog?.blog_id
                                  )
                                );
                                setNotification("Blog deleted successfully!");
                                setTimeout(() => {
                                  setNotification("");
                                  setSelectedBlog(null);
                                }, 2500);
                              } else {
                                setNotification("Failed to delete blog.");
                                setTimeout(() => setNotification(""), 4000);
                              }
                            })
                            .catch((err) => {
                              console.error("Delete error:", err);
                              setNotification(
                                "Error occurred while deleting blog."
                              );
                              setTimeout(() => setNotification(""), 4000);
                            });

                          setConfirmDeleteVisible(false);
                        }}
                      >
                        Yes
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => setConfirmDeleteVisible(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
                <div className="admin-blogs-modal-inner-content-top">
                  <div className="admin-blogs-modal-left">
                    <h2>Blog Details</h2>
                    <div className="admin-blogs-modal-id">
                      <p>
                        <strong>ID</strong>
                      </p>
                      <p className="admin-blogs-modal-id-content">
                        {selectedBlog.blog_id}
                      </p>
                    </div>
                    <div className="admin-blogs-modal-title">
                      <p>
                        <strong>Title</strong>
                        {submittedEdit && !editableBlog?.title?.trim() && (
                          <span style={{ color: "red" }}>*</span>
                        )}
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableBlog?.title || ""}
                          onChange={(e) =>
                            editableBlog &&
                            setEditableBlog({
                              ...editableBlog,
                              title: e.target.value,
                            })
                          }
                          className="admin-blogs-modal-title-content"
                        />
                      ) : (
                        <p className="admin-blogs-modal-title-content">
                          {selectedBlog.title}
                        </p>
                      )}
                    </div>
                    <div className="admin-blogs-modal-category">
                      <p>
                        <strong>Category</strong>
                      </p>
                      <select
                        className={`admin-blogs-modal-select modal-category-${(isEditing ? editableBlog?.category : selectedBlog.category).toLowerCase()}`}
                        value={
                          isEditing
                            ? editableBlog?.category
                            : selectedBlog.category
                        }
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableBlog({
                            ...editableBlog!,
                            category: e.target.value,
                          })
                        }
                      >
                        {[
                          "KALUSUGAN",
                          "KALIKASAN",
                          "KARUNUNGAN",
                          "KULTURA",
                          "KASARIAN",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-blogs-modal-author">
                      <p>
                        <strong>Author</strong>
                      </p>
                      <p className="admin-blogs-modal-author-content">
                        {selectedBlog.author}
                      </p>
                    </div>
                    <div className="admin-blogs-modal-status">
                      <p>
                        <strong>Status</strong>
                      </p>
                      <select
                        className={`admin-blogs-modal-select modal-status-${(isEditing ? editableBlog?.blog_status : selectedBlog.blog_status).toLowerCase()}`}
                        value={
                          isEditing
                            ? editableBlog?.blog_status
                            : selectedBlog.blog_status
                        }
                        disabled={!isEditing}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === "PINNED") {
                            const pinnedBlogsCount = blogs.filter(
                              (blog) => blog.blog_status === "PINNED"
                            ).length;
                            const isCurrentlyPinned =
                              editableBlog?.blog_status === "PINNED";
                            if (pinnedBlogsCount >= 3 && !isCurrentlyPinned) {
                              setNotification(
                                "You can only pin up to 3 blogs. Please unpin one first."
                              );
                              setTimeout(() => setNotification(""), 4000);
                              return;
                            }
                          }
                          setEditableBlog({
                            ...editableBlog!,
                            blog_status: newStatus,
                          });
                        }}
                      >
                        {editStatusOptions().map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-blogs-modal-date">
                      <p>
                        <strong>Created At</strong>
                      </p>
                      <p className="admin-blogs-modal-date-content">
                        {formatDate(selectedBlog.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="admin-blogs-modal-right">
                    <div className="admin-blogs-modal-image">
                      <p>
                        <strong>Main Image</strong>
                        {submittedEdit && !editableBlog?.image_url && (
                          <span style={{ color: "red" }}>*</span>
                        )}
                      </p>
                      {(
                        isEditing
                          ? editableBlog?.image_url
                          : selectedBlog.image_url
                      ) ? (
                        <img
                          src={`http://localhost${isEditing ? editableBlog?.image_url : selectedBlog.image_url}`}
                          alt="Blog"
                          style={{ cursor: "zoom-in" }}
                          onClick={() =>
                            setFullImageUrl(
                              `http://localhost${isEditing ? editableBlog?.image_url : selectedBlog.image_url}`
                            )
                          }
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          No Blog Image
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-image-input"
                        onChange={(e) => handleImageUpload(e)}
                      />
                      <div className="admin-blogs-image-buttons">
                        <button
                          className="upload-btn"
                          disabled={!isEditing}
                          onClick={() => {
                            if (isEditing)
                              document
                                .getElementById("upload-image-input")
                                ?.click();
                          }}
                        >
                          Upload
                        </button>
                        <button
                          className="remove-btn"
                          disabled={!isEditing}
                          onClick={handleImageRemove}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {(isEditing || selectedBlog.more_images) && (
                      <div className="admin-blogs-modal-more-images">
                        <p>
                          <strong>More Images</strong>
                        </p>
                        <div className="blog-more-image-grid">
                          {[...Array(4)].map((_, i) => {
                            const image = isEditing
                              ? editableBlogMoreImages[i]
                              : selectedBlog.more_images?.[i];
                            const totalImages = isEditing
                              ? editableBlogMoreImages.length
                              : selectedBlog.more_images?.length || 0;
                            const isLast = i === 3 && totalImages > 4;

                            if (image) {
                              return (
                                <div key={i} className="blog-image-preview">
                                  <img
                                    src={`http://localhost${image}`}
                                    alt={`More Image ${i}`}
                                    onClick={() =>
                                      setFullImageUrl(
                                        `http://localhost${image}`
                                      )
                                    }
                                    style={{ cursor: "zoom-in" }}
                                  />
                                  {isLast && (
                                    <div
                                      className="blog-image-overlay"
                                      onClick={() =>
                                        setShowAllImagesModal(true)
                                      }
                                    >
                                      +{totalImages - 3}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return isEditing ? (
                                <label
                                  key={i}
                                  htmlFor="edit-more-images-input"
                                  className="blog-more-image-placeholder-cell clickable"
                                >
                                  <span className="blog-placeholder-icon">
                                    +
                                  </span>
                                </label>
                              ) : (
                                <div
                                  key={i}
                                  className="blog-more-image-placeholder-cell"
                                >
                                  <span className="blog-placeholder-icon">
                                    +
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </div>
                        <div className="edit-more-images-buttons">
                          <button
                            className="upload-btn"
                            onClick={() =>
                              document
                                .getElementById("edit-more-images-input")
                                ?.click()
                            }
                            disabled={!isEditing}
                          >
                            Add More
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => {
                              if (isEditing) {
                                setEditableBlogMoreImages([]);
                              }
                            }}
                            disabled={!isEditing}
                          >
                            Clear All
                          </button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          id="edit-more-images-input"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || !isEditing) return;

                            const uploaded: string[] = [];

                            for (const file of Array.from(files)) {
                              const formData = new FormData();
                              formData.append("image", file);

                              try {
                                const res = await fetch(
                                  "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_blog_image.php",
                                  {
                                    method: "POST",
                                    body: formData,
                                  }
                                );
                                const data = await res.json();
                                if (data.success && data.image_url) {
                                  uploaded.push(data.image_url);
                                }
                              } catch (err) {
                                console.error("Upload failed:", err);
                              }
                            }

                            setEditableBlogMoreImages((prev) => [
                              ...prev,
                              ...uploaded,
                            ]);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-blogs-modal-inner-content-bot">
                  <div className="admin-events-inner-content-modal-desc">
                    <p>
                      <strong>Blog Content</strong>
                      {submittedEdit && !rawText && (
                        <span style={{ color: "red" }}>*</span>
                      )}
                    </p>
                    {isEditing ? (
                      <>
                        <div className="admin-blogs-content-image-tools">
                          <button
                            className="format-btn undo"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={() => document.execCommand("undo", false)}
                          >
                            <FaUndo />
                          </button>
                          <button
                            className="format-btn redo"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={() => document.execCommand("redo", false)}
                          >
                            <FaRedo />
                          </button>
                          <button
                            className="format-btn bold"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={() => applyFormatting("bold")}
                          >
                            <FaBold />
                          </button>
                          <button
                            className="format-btn italic"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={() => applyFormatting("italic")}
                          >
                            <FaItalic />
                          </button>
                          <button
                            className="format-btn underline"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={() => applyFormatting("underline")}
                          >
                            <FaUnderline />
                          </button>
                          <button
                            className="format-btn bullet"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              saveSelection();
                            }}
                            onClick={applyList}
                          >
                            <FaListUl />
                          </button>
                          <button
                            className="format-btn image"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              document
                                .getElementById("new-content-image-input")
                                ?.click()
                            }
                          >
                            <FaImage />
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            id="new-content-image-input"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append("image", file);

                              try {
                                const res = await fetch(
                                  "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_event_image.php",
                                  {
                                    method: "POST",
                                    body: formData,
                                  }
                                );

                                const data = await res.json();
                                if (data.success && data.image_url) {
                                  const img = `<img src="http://localhost${data.image_url}" alt="event image" style="max-width:100%; margin: 10px 0; display:block;" />`;
                                  const div = document.getElementById(
                                    "new-event-content-editor"
                                  );
                                  if (div) {
                                    div.innerHTML += img;
                                    setEditableBlog((prev) =>
                                      prev
                                        ? { ...prev, content: div.innerHTML }
                                        : prev
                                    );
                                  }
                                } else {
                                  alert("Image upload failed.");
                                }
                              } catch (err) {
                                console.error("Upload failed:", err);
                                alert("An error occurred during upload.");
                              }
                            }}
                          />
                        </div>
                        <div
                          id="new-event-content-editor"
                          ref={textareaRef}
                          className="admin-blogs-modal-desc-content editable"
                          contentEditable
                          onBlur={() => {
                            if (textareaRef.current) {
                              const updatedContent =
                                textareaRef.current.innerHTML;
                              setEditableBlog((prev) =>
                                prev
                                  ? { ...prev, content: updatedContent }
                                  : prev
                              );
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="admin-blogs-modal-desc-content">
                        <div className="admin-blogs-content-images-wrapper">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedBlog.content,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {newBlogModalOpen && (
        <div className="admin-blogs-new-blog">
          <div className="admin-blogs-new-blog-modal">
            <div className="admin-blogs-new-blog-modal-content">
              <div className="admin-blogs-new-blog-float-buttons">
                <button className="save-btn" onClick={handleNewBlogSave}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    resetNewBlogForm();
                    setNewBlogMoreImages([]);
                    setShowAllImagesModal(false);
                    setNewBlogModalOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
              <button
                className="admin-blogs-new-blog-modal-close"
                onClick={() => {
                  resetNewBlogForm();
                  setNewBlogMoreImages([]);
                  setShowAllImagesModal(false);
                  setNewBlogModalOpen(false);
                }}
              >
                ✕
              </button>
              <div className="admin-blogs-new-blog-modal-inner-content">
                <div className="admin-blogs-new-blog-modal-inner-content-top">
                  <div className="admin-blogs-new-blog-modal-left">
                    <h2>Add New Blog</h2>
                    <div className="admin-blogs-new-blog-modal-title">
                      <p>
                        <strong>
                          Title{" "}
                          {(!submitted || !newBlogTitle.trim()) && (
                            <span style={{ color: "red" }}>*</span>
                          )}
                        </strong>
                      </p>
                      <input
                        type="text"
                        className="admin-blogs-new-blog-modal-title-content"
                        value={newBlogTitle}
                        onChange={(e) => setNewBlogTitle(e.target.value)}
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="admin-blogs-new-blog-modal-category">
                      <p>
                        <strong>
                          Category{" "}
                          {(!submitted || !newBlogCategory.trim()) && (
                            <span style={{ color: "red" }}>*</span>
                          )}
                        </strong>
                      </p>
                      <select
                        className="admin-blogs-new-blog-modal-select modal-category-pink"
                        value={newBlogCategory}
                        onChange={(e) => setNewBlogCategory(e.target.value)}
                      >
                        {[
                          "KALUSUGAN",
                          "KALIKASAN",
                          "KARUNUNGAN",
                          "KULTURA",
                          "KASARIAN",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-blogs-new-blog-modal-author">
                      <p>
                        <strong>Author</strong>
                      </p>
                      <p className="admin-blogs-new-blog-modal-author-content">
                        {newBlogAuthorName}
                      </p>
                    </div>
                    <div className="admin-blogs-new-blog-modal-status">
                      <p>
                        <strong>
                          Status{" "}
                          {(!submitted || !newBlogStatus.trim()) && (
                            <span style={{ color: "red" }}>*</span>
                          )}
                        </strong>
                      </p>
                      <select
                        className={`admin-blogs-new-blog-modal-select modal-status-${newBlogStatus.toLowerCase()}`}
                        value={newBlogStatus}
                        onChange={(e) => setNewBlogStatus(e.target.value)}
                      >
                        {["DRAFT", "PUBLISHED"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="admin-blogs-new-blog-modal-right">
                    <div className="admin-blogs-new-blog-modal-image">
                      <p>
                        <strong>
                          Main Image{" "}
                          {(!submitted || !newBlogImage) && (
                            <span style={{ color: "red" }}>*</span>
                          )}
                        </strong>
                      </p>
                      {newBlogImage ? (
                        <img
                          src={`http://localhost${newBlogImage}`}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            borderRadius: "4px",
                            cursor: "zoom-in",
                          }}
                          onClick={() =>
                            setFullImageUrl(`http://localhost${newBlogImage}`)
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "200px",
                            maxWidth: "100%",
                            maxHeight: "300px",
                            backgroundColor: "#f2f2f2",
                            color: "#888",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontStyle: "italic",
                            border: "1px dashed #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          No Blog Image
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="new-blog-image-input"
                        onChange={handleNewBlogImageUpload}
                      />
                      <div className="admin-blogs-image-buttons">
                        <button
                          className="upload-btn"
                          onClick={() =>
                            document
                              .getElementById("new-blog-image-input")
                              ?.click()
                          }
                        >
                          Upload
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => setNewBlogImage("")}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="admin-blogs-new-blog-modal-image">
                      <p>
                        <strong>More Images</strong>
                      </p>
                      <div className="blog-more-image-grid">
                        {[...Array(4)].map((_, i) => {
                          const image = newBlogMoreImages[i];
                          const totalImages = newBlogMoreImages.length;
                          const isLast = i === 3 && totalImages > 4;
                          if (image) {
                            return (
                              <div key={i} className="blog-image-preview">
                                <img
                                  src={`http://localhost${image}`}
                                  alt={`More Image ${i}`}
                                  onClick={() =>
                                    setFullImageUrl(`http://localhost${image}`)
                                  }
                                  style={{ cursor: "zoom-in" }}
                                />
                                {isLast && (
                                  <div
                                    className="blog-image-overlay"
                                    onClick={() => setShowAllImagesModal(true)}
                                  >
                                    +{totalImages - 3}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <label
                                key={i}
                                htmlFor="new-blog-more-images-input"
                                className="blog-more-image-placeholder-cell clickable"
                              >
                                <span className="blog-placeholder-icon">+</span>
                              </label>
                            );
                          }
                        })}
                      </div>
                      <div className="edit-more-images-buttons">
                        <button
                          className="upload-btn"
                          onClick={() =>
                            document
                              .getElementById("new-blog-more-images-input")
                              ?.click()
                          }
                        >
                          Add More
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => setNewBlogMoreImages([])}
                        >
                          Clear All
                        </button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        id="new-blog-more-images-input"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const uploaded: string[] = [];
                          for (const file of Array.from(files)) {
                            const formData = new FormData();
                            formData.append("image", file);
                            try {
                              const res = await fetch(
                                "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_blog_image.php",
                                {
                                  method: "POST",
                                  body: formData,
                                }
                              );
                              const data = await res.json();
                              if (data.success && data.image_url) {
                                uploaded.push(data.image_url);
                              }
                            } catch (err) {
                              console.error("Upload failed:", err);
                            }
                          }
                          setNewBlogMoreImages((prev) => [
                            ...prev,
                            ...uploaded,
                          ]);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-blogs-new-blog-modal-inner-content-bot">
                  <div className="admin-blogs-new-blog-modal-desc">
                    <p>
                      <strong>
                        Blog Content{" "}
                        {(!submitted || !newBlogContent.trim()) && (
                          <span style={{ color: "red" }}>*</span>
                        )}
                      </strong>
                    </p>
                    <div className="admin-blogs-new-blog-modal-desc">
                      <div className="admin-blogs-content-image-tools">
                        <button
                          className="format-btn undo"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => document.execCommand("undo")}
                        >
                          <FaUndo />
                        </button>
                        <button
                          className="format-btn redo"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => document.execCommand("redo")}
                        >
                          <FaRedo />
                        </button>
                        <button
                          className="format-btn bold"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => document.execCommand("bold")}
                        >
                          <FaBold />
                        </button>
                        <button
                          className="format-btn italic"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => document.execCommand("italic")}
                        >
                          <FaItalic />
                        </button>
                        <button
                          className="format-btn underline"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => document.execCommand("underline")}
                        >
                          <FaUnderline />
                        </button>
                        <button
                          className="format-btn bullet"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            document.execCommand("insertUnorderedList")
                          }
                        >
                          <FaListUl />
                        </button>
                        <button
                          className="format-btn image"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            document
                              .getElementById("new-content-image-input")
                              ?.click()
                          }
                        >
                          <FaImage />
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          id="new-content-image-input"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("image", file);
                            try {
                              const res = await fetch(
                                "http://localhost/tara-kabataan/tara-kabataan-backend/api/upload_blog_image.php",
                                {
                                  method: "POST",
                                  body: formData,
                                }
                              );
                              const data = await res.json();
                              if (data.success && data.image_url) {
                                const img = `<img src="http://localhost${data.image_url}" alt="blog image" style="max-width:100%;" />`;
                                const div = document.getElementById(
                                  "new-blog-content-editor"
                                );
                                if (div) div.innerHTML += img;
                                setNewBlogContent((prev) => prev + img);
                              } else {
                                alert("Image upload failed.");
                              }
                            } catch (err) {
                              alert("Upload failed.");
                              console.error(err);
                            }
                          }}
                        />
                      </div>
                      <div
                        id="new-blog-content-editor"
                        className="admin-blogs-new-blog-modal-desc-content editable"
                        contentEditable
                        onBlur={(e) =>
                          setNewBlogContent(e.currentTarget.innerHTML)
                        }
                        dangerouslySetInnerHTML={{ __html: newBlogContent }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAllImagesModal && (
        <div className="blog-gallery-modal">
          <div
            className="blog-gallery-overlay"
            onClick={() => setShowAllImagesModal(false)}
          ></div>
          <div className="blog-gallery-wrapper">
            <button
              className="blog-gallery-close"
              onClick={() => setShowAllImagesModal(false)}
            >
              ✕
            </button>

            <div className="blog-gallery-grid">
              {(isEditing
                ? editableBlogMoreImages
                : newBlogModalOpen
                  ? newBlogMoreImages
                  : selectedBlog?.more_images || []
              ).map((img, index) => (
                <div
                  key={index}
                  className={`blog-gallery-thumb ${isEditing ? "editable-mode" : ""}`}
                >
                  <div
                    className="thumb-image-wrapper"
                    onClick={() => setFullImageUrl(`http://localhost${img}`)}
                  >
                    <img
                      src={`http://localhost${img}`}
                      alt={`More Image ${index}`}
                    />

                    {(isEditing || newBlogModalOpen) && (
                      <div className="thumb-controls">
                        {index > 0 && (
                          <button
                            className="thumb-swap-left"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updater = isEditing
                                ? setEditableBlogMoreImages
                                : setNewBlogMoreImages;
                              updater((prev) => {
                                const updated = [...prev];
                                [updated[index - 1], updated[index]] = [
                                  updated[index],
                                  updated[index - 1],
                                ];
                                return updated;
                              });
                            }}
                          >
                            ←
                          </button>
                        )}

                        <button
                          className="thumb-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmThumbDeleteIndex(index);
                            const updater = isEditing
                              ? setEditableBlogMoreImages
                              : setNewBlogMoreImages;
                            updater((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          🗑
                        </button>

                        {index < imageList.length - 1 && (
                          <button
                            className="thumb-swap-right"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updater = isEditing
                                ? setEditableBlogMoreImages
                                : setNewBlogMoreImages;
                              updater((prev) => {
                                const updated = [...prev];
                                [updated[index], updated[index + 1]] = [
                                  updated[index + 1],
                                  updated[index],
                                ];
                                return updated;
                              });
                            }}
                          >
                            →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {fullImageUrl && (
        <div className="blog-fullscreen-viewer">
          <div
            className="blog-fullscreen-backdrop"
            onClick={() => setFullImageUrl("")}
          ></div>
          <img
            src={fullImageUrl}
            alt="Fullscreen"
            className="blog-fullscreen-image"
          />
          <button
            className="blog-fullscreen-exit"
            onClick={() => setFullImageUrl("")}
          >
            ✕
          </button>
        </div>
      )}
      {bulkConfirmVisible && (
        <div className="blogs-confirmation-popup show">
          <div className="blogs-confirmation-box">
            <p>
              {bulkActionType === "delete"
                ? "Are you sure you want to delete the selected blogs?"
                : `Do you really want to mark the selected blogs as ${bulkActionStatus}?`}
            </p>
            <div className="blogs-confirmation-actions">
              <button
                className="confirm-yes"
                onClick={() => {
                  if (bulkActionType === "delete") {
                    handleBulkDelete();
                  } else {
                    applyBulkStatus(bulkActionStatus);
                  }
                  setBulkConfirmVisible(false);
                }}
              >
                Yes
              </button>
              <button
                className="confirm-no"
                onClick={() => setBulkConfirmVisible(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AdminBlogs;
