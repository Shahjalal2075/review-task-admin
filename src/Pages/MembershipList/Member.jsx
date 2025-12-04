import React, { useContext, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CombinationTask from '../CombinationTask/CombinationTask';
import { AuthContext } from '../../Providers/AuthProvider';

const Member = ({ data, onDelete }) => {
    const { userAccount } = useContext(AuthContext);
    const navigate = useNavigate();
    const userEmail = ((data.email === '') ? data.phone : data.email);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userFrozenStatus, setUserFrozenStatus] = useState(data.frozenStatus);
    const [userRefferStatus, setUserRefferStatus] = useState(data.invitationStatus);
    const [userWithdrawStatus, setUserWuserWithdrawStatus] = useState(data.withdrawStatus);
    const [userTotalBal, setUserTotalBal] = useState(data.totalBal);
    const [userTrainingBal, setUserTrainingBal] = useState(data.trainingBal);
    const [userResetCount, setUserResetCount] = useState(data.resetCount);
    const [userTotalDeposit, setUserTotalDeposit] = useState(data.totalDeposit);
    const [userVipLevel, setUserVipLevel] = useState(data.vipLevel);
    const [userSuperviser, setUserSuperviser] = useState(data.superviser);
    const [userTaskCount, setUserTaskCount] = useState(data.taskCount);
    const [userReputation, setUserReputation] = useState(data.reputation);
    const [userTimeExtend, setUserTimeExtend] = useState(data.combinationEndTine);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vipLevels, setVipLevels] = useState([]);
    const [targetTask, setTargetTask] = useState(0);
    useEffect(() => {
        let intervalId;
        console.log(userEmail);
        const fetchData = async () => {
            try {
                const response = await fetch(`https://review-task-server.vercel.app/user-list/${userEmail}`);
                const data = await response.json();
                setUser(data);
                setUserFrozenStatus(data.frozenStatus);
                setUserRefferStatus(data.invitationStatus);
                setUserWuserWithdrawStatus(data.withdrawStatus);
                setUserTotalBal(data.totalBal);
                setUserTotalDeposit(data.totalDeposit);
                setUserVipLevel(data.vipLevel);
                setUserSuperviser(data.superviser);
                setUserTaskCount(data.taskCount);
                setUserReputation(data.reputation);
                setUserTimeExtend(data.combinationEndTine);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching member data:', error);
            }
        };

        fetchData();

        intervalId = setInterval(fetchData, 3000);

        return () => clearInterval(intervalId);
    }, [userEmail]);

    useEffect(() => {
        fetchVipLevels();
    }, []);

    const fetchVipLevels = async () => {
        try {
            const res = await fetch("https://review-task-server.vercel.app/vip-level");
            const data = await res.json();
            setVipLevels(data); // if you still need to set this globally

            const vipSelect = data.find((vip) => vip.vip === userVipLevel);
            if (vipSelect) {
                setTargetTask(vipSelect.taskLimit);
            } else {
                console.warn("No VIP level found matching:", user.vipLevel);
            }
        } catch (error) {
            console.error("Failed to fetch VIP levels:", error);
        }
    };


    const handleCombinationTask = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const MySwal = withReactContent(Swal);

    const handleExtendTime = () => {
        let timerInterval;

        const originalExtendTime = new Date(userTimeExtend);
        let remainingTime = Math.floor((originalExtendTime.getTime() - Date.now()) / 1000);

        const formatTime = (secs) => {
            const h = String(Math.floor(secs / 3600)).padStart(2, '0');
            const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
            const s = String(secs % 60).padStart(2, '0');
            return `${h} : ${m} : ${s}`;
        };

        MySwal.fire({
            width: 420,
            title: '⏱ Extend Timer',
            html: `
            <div style="text-align: left; font-size: 14px;">
                <p><strong>Current Countdown:</strong></p>
                <div id="countdown-timer" style="font-size: 22px; font-weight: bold; color: #10B981; margin-bottom: 10px;">
                    ${formatTime(remainingTime)}
                </div>
                <p style="margin: 8px 0;"><strong>Add Time:</strong></p>
                <div style="display: flex; gap: 6px;">
                    <input id="extend-hours" type="number" min="0" placeholder="HH" style="flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #ccc;" />
                    <input id="extend-mins" type="number" min="0" max="59" placeholder="MM" style="flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #ccc;" />
                    <input id="extend-secs" type="number" min="0" max="59" placeholder="SS" style="flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #ccc;" />
                </div>
            </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✅ Confirm',
            cancelButtonText: '❌ Cancel',
            focusConfirm: false,
            preConfirm: () => {
                const h = parseInt(document.getElementById("extend-hours").value || 0);
                const m = parseInt(document.getElementById("extend-mins").value || 0);
                const s = parseInt(document.getElementById("extend-secs").value || 0);
                const totalSecs = h * 3600 + m * 60 + s;

                if (totalSecs <= 0) {
                    Swal.showValidationMessage("Please enter a time greater than 0.");
                }

                return { h, m, s, totalSecs };
            },
            didOpen: () => {
                const timerEl = document.getElementById("countdown-timer");
                timerInterval = setInterval(() => {
                    remainingTime--;
                    if (timerEl) timerEl.textContent = formatTime(remainingTime);
                    if (remainingTime <= 0) clearInterval(timerInterval);
                }, 1000);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const addedTime = result.value.totalSecs;

                // Calculate new extended time
                const newExtendTime = new Date(originalExtendTime.getTime() + addedTime * 1000);

                // Update remaining time (optional)
                remainingTime = Math.floor((newExtendTime.getTime() - Date.now()) / 1000);

                fetch(`https://review-task-server.vercel.app/user-list/combine-time-extend/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        combinationEndTine: newExtendTime.toISOString()
                    })
                })

                Swal.fire({
                    icon: 'success',
                    title: '⏳ Time Extended',
                    html: `
                    <p>Timer extended by:</p>
                    <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
                        ${result.value.h}h ${result.value.m}m ${result.value.s}s
                    </p>
                    `,
                    timer: 2000,
                    showConfirmButton: false
                });


                setUserTimeExtend(newExtendTime.toISOString());
                console.log(userTimeExtend);
            }
        });
    };


    const handlePersonalPromotion = () => {
        MySwal.fire({
            title: `📣 Personal Promotion`,
            html: `
              <div style="text-align: left;">
                <p><strong>Member account:</strong> ${user.username}</p>
                
                <label for="promotion-message" style="display: block; margin-top: 10px; font-weight: 500;">Promotion Message</label>
                <textarea id="promotion-message" class="swal2-textarea" placeholder="Enter your promotion content..." rows="1" style="resize: none; width: 80%; margin-top: 6px;"></textarea>
                
                <label for="promotion-image" style="display: block; margin-top: 12px; font-weight: 500;">Promotion Image</label>
                <input type="file" id="promotion-image" accept="image/*" class="swal2-file" style="margin-top: 6px; width: 80%;" />
    
                <div style="display: flex; align-items: center; margin-top: 14px;">
                  <label for="promotion-toggle" style="font-weight: 500; margin-right: 10px;">Promotion Active:</label>
                  <input type="checkbox" id="promotion-toggle" ${user.isPromotion ? "checked" : ""} />
                </div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Send Promotion",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3B82F6",
            cancelButtonColor: "#9CA3AF",
            focusConfirm: false,
            preConfirm: () => {
                const message = document.getElementById("promotion-message").value.trim();
                const imageInput = document.getElementById("promotion-image");
                const imageFile = imageInput.files[0];
                const toggleStatus = document.getElementById("promotion-toggle").checked;

                return {
                    message: message || "",
                    imageFile: imageFile || null,
                    toggleStatus
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { message, imageFile, toggleStatus } = result.value;

                if (imageFile) {
                    const formData = new FormData();
                    formData.append("image", imageFile);

                    fetch(`https://api.imgbb.com/1/upload?key=31305da6f416afe11565950430cdcbbb`, {
                        method: "POST",
                        body: formData
                    })
                        .then(res => res.json())
                        .then(data => {
                            const imageUrl = data.success ? data.data.url : "";

                            const updatedData = {
                                isPromotion: toggleStatus,
                                promotionMsg: {
                                    cover: imageUrl,
                                    message: message
                                },
                            }

                            fetch(`https://review-task-server.vercel.app/user-list/promotion-update/${userEmail}`, {
                                method: 'PATCH',
                                headers: {
                                    'content-type': 'application/json'
                                },
                                body: JSON.stringify(updatedData)
                            })
                                .then(() => {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Promotion Sent",
                                        text: `Your promotion message to ${user.username} was sent successfully!`,
                                        showConfirmButton: false,
                                        timer: 1800,
                                        background: "#EFF6FF",
                                        iconColor: "#3B82F6"
                                    });
                                })
                                .catch(() => {
                                    Swal.fire("Upload Error", "An error occurred while uploading the image.", "error");
                                });


                        })
                        .catch(() => {
                            Swal.fire("Upload Error", "An error occurred while uploading the image.", "error");
                        });
                } else {
                    const updatedData = {
                        isPromotion: toggleStatus,
                        promotionMsg: {
                            cover: "",
                            message: message
                        },
                    }

                    fetch(`https://review-task-server.vercel.app/user-list/promotion-update/${userEmail}`, {
                        method: 'PATCH',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(updatedData)
                    })
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Promotion Sent",
                                text: `Your promotion message to ${user.username} was sent successfully!`,
                                showConfirmButton: false,
                                timer: 1800,
                                background: "#EFF6FF",
                                iconColor: "#3B82F6"
                            });
                        })
                        .catch(() => {
                            Swal.fire("Upload Error", "An error occurred while uploading the image.", "error");
                        });
                }
            }
        });
    };

    const handleFreezeAcc = () => {

        MySwal.fire({
            title: `Are you sure ?`,
            text: `Account: ${user.username}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: user.frozenStatus ? '#3085d6' : '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: `Yes, Confirm it`,
        }).then((result) => {
            if (result.isConfirmed) {

                fetch(`https://review-task-server.vercel.app/user-list/frozen-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ frozenStatus: !userFrozenStatus })
                })
                    .then(() => {
                        setUserFrozenStatus(!userFrozenStatus);
                        MySwal.fire({
                            icon: 'success',
                            title: 'Account Unfrozen',
                            text: `Done.`,
                            confirmButtonColor: '#3085d6',
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    }

    const handleAddMoney = () => {
        MySwal.fire({
            title: `<span style="color:#4f46e5;">💸 Add Balance</span>`,
            html: `
            <div style="font-size: 16px;">
              <!-- Member Info -->
              <p style="margin-bottom: 16px;">
                <strong style="color:#059669;">👤 Member Account:</strong> 
                <span style="color:#111827;">${user.username}</span>
              </p>
      
              <!-- Balance Type Dropdown -->
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <label for="balancetype" style="width: 140px; color:#3b82f6;">📂 Balance Type</label>
                <select id="balancetype" class="swal2-input" style="flex: 1; background-color:#e0f2fe; border-color:#3b82f6;">
                  <option value="Deposit">💰 Deposit</option>
                  <option value="Bonus">🎁 Bonus</option>
                  <option value="Salary">💼 Salary</option>
                  <option value="Deductbalance">🧾 Deduct Balance</option>
                </select>
              </div>
      
              <!-- Amount Input -->
              <div style="display: flex; align-items: center;">
                <label for="amount" style="width: 140px; color:#3b82f6;">💵 Amount</label>
                <input id="amount" class="swal2-input" type="number" placeholder="Enter amount" style="flex: 1; background-color:#ecfccb; border-color:#84cc16;" />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: '✅ Confirm',
            cancelButtonText: '❌ Cancel',
            customClass: {
                popup: 'swal2-popup-border-radius',
            },
            preConfirm: () => {
                const balancetype = document.getElementById('balancetype')?.value;
                const amount = document.getElementById('amount')?.value;

                if (!amount || isNaN(amount) || Number(amount) <= 0) {
                    Swal.showValidationMessage('⚠️ Please enter a valid amount');
                    return false;
                }

                return { balancetype, amount };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { balancetype, amount } = result.value;
                const timestamp = new Date().toISOString();
                const deposit = {
                    username: user.username,
                    amount,
                    status: "Success",
                    depositTime: timestamp,
                    operator: userAccount,
                    depositType: balancetype
                }
                const depositBal = {
                    totalBal: balancetype === "Deductbalance" ? user.totalBal - parseFloat(amount) : user.totalBal + parseFloat(amount),
                    totalDeposit: balancetype === "Deductbalance" ? user.totalDeposit : user.totalDeposit + parseFloat(amount),
                    totalWithdraw: user.totalWithdraw
                }

                fetch('https://review-task-server.vercel.app/deposit', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(deposit)
                })
                fetch(`https://review-task-server.vercel.app/user-list/bal-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(depositBal)
                })
                    .then(() => {
                        setUserTotalBal(userTotalBal + parseFloat(amount));
                        setUserTotalDeposit(userTotalDeposit + parseFloat(amount));
                        MySwal.fire({
                            icon: 'success',
                            title: '🎉 Success!',
                            html: `<strong>${user.username}</strong>'s balance has been updated with <strong>${amount}</strong> (${balancetype}).`,
                            confirmButtonColor: '#10b981',
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };

    const handleTrainingMoney = () => {
        MySwal.fire({
            title: `<span style="color:#4f46e5;">💸 Add Balance</span>`,
            html: `
            <div style="font-size: 16px;">
              <!-- Member Info -->
              <p style="margin-bottom: 16px;">
                <strong style="color:#059669;">👤 Member Account:</strong> 
                <span style="color:#111827;">${user.username}</span>
              </p>
      
              <!-- Balance Type Dropdown -->
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <label for="balancetype" style="width: 140px; color:#3b82f6;">📂 Balance Type</label>
                <select id="balancetype" class="swal2-input" style="flex: 1; background-color:#e0f2fe; border-color:#3b82f6;">
                  <option value="Training">💰 Training</option>
                </select>
              </div>
      
              <!-- Amount Input -->
              <div style="display: flex; align-items: center;">
                <label for="amount" style="width: 140px; color:#3b82f6;">💵 Amount</label>
                <input id="amount" class="swal2-input" type="number" placeholder="Enter amount" style="flex: 1; background-color:#ecfccb; border-color:#84cc16;" />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: '✅ Confirm',
            cancelButtonText: '❌ Cancel',
            customClass: {
                popup: 'swal2-popup-border-radius',
            },
            preConfirm: () => {
                const balancetype = document.getElementById('balancetype')?.value;
                const amount = document.getElementById('amount')?.value;

                if (!amount || isNaN(amount) || Number(amount) <= 0) {
                    Swal.showValidationMessage('⚠️ Please enter a valid amount');
                    return false;
                }

                return { balancetype, amount };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { balancetype, amount } = result.value;
                const timestamp = new Date().toISOString();
                const deposit = {
                    username: user.username,
                    amount,
                    status: "Success",
                    depositTime: timestamp,
                    operator: userAccount,
                    depositType: balancetype
                }
                const depositBal = {
                    trainingBal: user.trainingBal + parseFloat(amount),
                }

                fetch('https://review-task-server.vercel.app/deposit', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(deposit)
                })
                fetch(`https://review-task-server.vercel.app/user-list/training-bal-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(depositBal)
                })
                    .then(() => {
                        setUserTrainingBal(userTrainingBal + parseFloat(amount));
                        MySwal.fire({
                            icon: 'success',
                            title: '🎉 Success!',
                            html: `<strong>${user.username}</strong>'s balance has been updated with <strong>${amount}</strong> (${balancetype}).`,
                            confirmButtonColor: '#10b981',
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };

    const handleRefferCodeStatus = () => {
        const action = userRefferStatus ? "disable" : "enable";

        Swal.fire({
            title: `Are you sure you want to ${action} the invitation code?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10B981", // green
            cancelButtonColor: "#EF4444", // red
            confirmButtonText: `Yes, ${action} it`,
        }).then((result) => {
            if (result.isConfirmed) {

                fetch(`https://review-task-server.vercel.app/user-list/reffer-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ invitationStatus: !userRefferStatus })
                })
                    .then(() => {
                        setUserRefferStatus(!userRefferStatus);
                        Swal.fire({
                            icon: "success",
                            title: `Invitation code ${action}d successfully!`,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    }

    const handleWithdrawStatus = () => {
        const action = !userWithdrawStatus ? "unrestrict" : "restrict";
        const actionText = !userWithdrawStatus ? "Unrestrict" : "Restrict";
        const userName = user.username || "this user";

        Swal.fire({
            title: `${actionText} Withdrawals for ${userName}?`,
            text: `Are you sure you want to ${action} withdrawals for ${userName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: !userWithdrawStatus ? "#10B981" : "#F59E0B",
            cancelButtonColor: "#EF4444",  // red
            confirmButtonText: `Yes, ${actionText}`,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`https://review-task-server.vercel.app/user-list/withdraw-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ withdrawStatus: !userWithdrawStatus })
                })
                    .then(() => {
                        setUserWuserWithdrawStatus(!userWithdrawStatus);
                        Swal.fire({
                            icon: "success",
                            title: `${userName}'s withdrawals have been ${action}ed!`,
                            text: `Action completed successfully.`,
                            confirmButtonColor: "#10B981", // green
                            timer: 1800,
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    }

    const handleVipLevel = () => {
        let selectedVip = user.vipLevel || 'VIP 0';

        const optionsHtml = vipLevels.map(level => {
            return `<option value="${level.vip}">${level.vip}</option>`;
        }).join('');

        MySwal.fire({
            title: '<span style="color: #6366F1;">🎖 Modify VIP Level</span>',
            html: `
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 16px; color: #374151;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-weight: 600; min-width: 140px;">👤 Member Account:</label>
                <span style="color: #10B981; font-weight: bold;">${user.username}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="vip-select" style="font-weight: 600; min-width: 140px;">🏅 VIP Grade:</label>
                <select id="vip-select" class="swal2-select"
                  style="
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 15px;
                    background-color: #F3F4F6;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    color: #111827;
                    min-width: 160px;
                  ">
                  ${optionsHtml}
                </select>
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: '<span style="color: white;">✅ Confirm</span>',
            cancelButtonText: '❌ Cancel',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#EF4444',
            background: '#FFFFFF',
            customClass: {
                popup: 'swal-wide-popup'
            },
            didOpen: () => {
                const select = document.getElementById('vip-select');
                if (select) select.value = selectedVip;
            },
            preConfirm: () => {
                const selectElement = document.getElementById('vip-select');
                return selectElement.value;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const isTraining = result.value === "Training";
                const trainingBal = isTraining ? 1000 : 0;
                const totalBal = isTraining ? userTotalBal : userTotalBal + trainingBal;
                fetch(`https://review-task-server.vercel.app/user-list/vip-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        vipLevel: result.value,
                        trainingBal: trainingBal,
                        totalBal: totalBal
                    })
                })
                    .then(() => {
                        setUserVipLevel(result.value);
                        Swal.fire({
                            icon: 'success',
                            title: '🎉 VIP Level Updated!',
                            text: `${user.username} is now ${result.value}`,
                            showConfirmButton: false,
                            timer: 1800,
                            background: '#ECFDF5',
                            iconColor: '#10B981'
                        });
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: 'error',
                            title: '⚠️ Update Failed',
                            text: 'Something went wrong. Please try again.',
                            background: '#FEF2F2',
                            iconColor: '#EF4444'
                        });
                    });
            }
        });
    };


    const handleModifyParent = () => {
        MySwal.fire({
            title: '<span style="color:#4F46E5;">🔗 Modify Invitation Code</span>',
            html: `
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 16px; color: #374151;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-weight: 600; min-width: 140px;">👤 Member Account:</label>
                <span style="font-weight: bold; color: #10B981;">${user.username}</span>
              </div>
      
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="invite-code-input" style="font-weight: 600; min-width: 140px;">📨 Invitation Code:</label>
                <input id="invite-code-input" class="swal2-input" type="text"
                  placeholder="Enter invitation code"
                  value="${userSuperviser || ''}"
                  style="
                    flex: 1;
                    font-size: 15px;
                    padding: 8px 12px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    background-color: #F9FAFB;
                    color: #111827;
                    min-width: 160px;
                  "
                />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: '<span style="color:white;">✅ Confirm</span>',
            cancelButtonText: '❌ Take away',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#EF4444',
            focusConfirm: false,
            background: '#ffffff',
            customClass: {
                popup: 'swal-wide-popup'
            },
            preConfirm: () => {
                const input = document.getElementById('invite-code-input').value.trim();
                if (!input) {
                    Swal.showValidationMessage('Please enter a valid Invitation Code');
                    return false;
                }
                return input;
            }
        }).then((result) => {
            if (result.isConfirmed) {

                fetch(`https://review-task-server.vercel.app/user-list/superviser-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ superviser: result.value })
                })
                    .then(() => {
                        setUserSuperviser(result.value);
                        Swal.fire({
                            icon: 'success',
                            title: '✅ Invitation Code Updated',
                            text: `${user.username} now has invitation code: ${result.value}`,
                            background: '#ECFDF5',
                            iconColor: '#10B981',
                            showConfirmButton: false,
                            timer: 1800
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };


    const handleResetTask = () => {
        const timestamp = new Date().toISOString();
        MySwal.fire({
            title: `🔄 Reset Task for ${user.username}?`,
            text: "This will reset all tasks for this user. Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, reset it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#F59E0B", // amber
            cancelButtonColor: "#6B7280",  // gray
        }).then((firstResult) => {
            if (firstResult.isConfirmed) {
                // Second Confirmation
                MySwal.fire({
                    title: `⚠️ Please Confirm Again`,
                    html: `<strong style="color:#EF4444">Final warning!</strong><br>Are you absolutely sure you want to reset <b>${user.username}'s</b> tasks?`,
                    icon: "error",
                    showCancelButton: true,
                    confirmButtonText: "Yes, I'm sure",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#DC2626", // red
                    cancelButtonColor: "#9CA3AF",  // gray
                }).then((secondResult) => {
                    if (secondResult.isConfirmed) {

                        fetch(`https://review-task-server.vercel.app/user-list/task-update/${userEmail}`, {
                            method: 'PATCH',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({ taskCount: 0, resetCount: user.resetCount + 1 })
                        })
                            .then(() => {
                                setUserTaskCount(0);
                                setUserResetCount(userResetCount + 1);
                                Swal.fire({
                                    icon: "success",
                                    title: "✅ Task Reset",
                                    text: `All tasks for ${user.username} have been reset.`,
                                    showConfirmButton: false,
                                    timer: 1800,
                                    background: "#ECFDF5",
                                    iconColor: "#10B981"
                                });
                            })
                            .catch(() => {

                            });
                    }
                });
            }
        });
    };

    const handleWithdrawPassword = () => {
        MySwal.fire({
            title: `<span style="font-size: 18px;">🔒 Set Withdraw Password</span>`,
            html: `
            <div style="text-align: left; font-size: 14px; padding-top: 4px;">
              <div style="margin-bottom: 12px;">
                <strong>Member account:</strong> ${user.username}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label for="withdraw-password" style="white-space: nowrap; font-weight: 500;">New Password:</label>
                <input 
                  type="password" 
                  id="withdraw-password" 
                  class="swal2-input" 
                  placeholder="Enter new password"
                  style="width: 100%; height: 36px; font-size: 13px; border-radius: 6px; margin: 0;"
                />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#10B981", // green
            cancelButtonColor: "#EF4444",  // red
            focusConfirm: false,
            preConfirm: () => {
                const password = document.getElementById("withdraw-password").value.trim();
                if (!password) {
                    Swal.showValidationMessage("Password cannot be empty.");
                    return false;
                }
                return password;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`https://review-task-server.vercel.app/user-list/withdraw-pass-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ withdrawPass: result.value })
                })
                    .then(() => {
                        Swal.fire({
                            icon: "success",
                            title: "Password Set",
                            text: `Withdraw password updated for ${user.username}`,
                            showConfirmButton: false,
                            timer: 1600,
                            background: "#ECFDF5",
                            iconColor: "#10B981"
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };

    const handleLoginPass = () => {
        MySwal.fire({
            title: `<span style="font-size: 18px;">🔑 Set Login Password</span>`,
            html: `
            <div style="text-align: left; font-size: 14px; padding-top: 4px;">
              <div style="margin-bottom: 12px;">
                <strong>Member account:</strong> ${user.username}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label for="login-password" style="white-space: nowrap; font-weight: 500;">New Password:</label>
                <input 
                  type="password" 
                  id="login-password" 
                  class="swal2-input" 
                  placeholder="Enter new password"
                  style="width: 100%; height: 36px; font-size: 13px; border-radius: 6px; margin: 0;"
                />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3B82F6", // blue
            cancelButtonColor: "#EF4444",  // red
            focusConfirm: false,
            preConfirm: () => {
                const password = document.getElementById("login-password").value.trim();
                if (!password) {
                    Swal.showValidationMessage("Password cannot be empty.");
                    return false;
                }
                return password;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`https://review-task-server.vercel.app/user-list/login-pass-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ password: result.value })
                })
                    .then(() => {
                        Swal.fire({
                            icon: "success",
                            title: "Password Updated",
                            text: `Login password updated for ${user.username}`,
                            showConfirmButton: false,
                            timer: 1600,
                            background: "#EFF6FF",
                            iconColor: "#3B82F6"
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };

    const handleCredibility = () => {
        MySwal.fire({
            title: '<span style="color:#6366F1;">💯 Edit Credibility</span>',
            html: `
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 16px; color: #374151;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-weight: 600; min-width: 140px;">👤 Member Account:</label>
                <span style="font-weight: bold; color: #10B981;">${user.username}</span>
              </div>
      
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="credibility-input" style="font-weight: 600; min-width: 140px;">🌟 Credibility:</label>
                <input id="credibility-input" class="swal2-input" type="number"
                  placeholder="Enter credibility"
                  value="${userReputation || 100}"
                  style="
                    flex: 1;
                    font-size: 15px;
                    padding: 8px 12px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    background-color: #F9FAFB;
                    color: #111827;
                    min-width: 160px;
                  "
                />
              </div>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: '<span style="color:white;">✅ Confirm</span>',
            cancelButtonText: '❌ Take away',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#EF4444',
            background: '#ffffff',
            preConfirm: () => {
                const input = document.getElementById('credibility-input').value.trim();
                if (!input || isNaN(input) || input < 0) {
                    Swal.showValidationMessage('Please enter a valid credibility score (number >= 0)');
                    return false;
                }
                return input;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`https://review-task-server.vercel.app/user-list/reputation-update/${userEmail}`, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ reputation: result.value + "%" })
                })
                    .then(() => {
                        setUserReputation(result.value + "%");
                        Swal.fire({
                            icon: 'success',
                            title: '✅ Credibility Updated',
                            text: `${user.username} now has credibility score: ${result.value}%`,
                            background: '#ECFDF5',
                            iconColor: '#10B981',
                            showConfirmButton: false,
                            timer: 1800
                        });
                    })
                    .catch(() => {

                    });
            }
        });
    };

    const handleDelete = () => {
        MySwal.fire({
            title: `Are you sure?`,
            text: `You are about to delete member: ${user.name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Yes, continue',
            cancelButtonText: 'Cancel',
        }).then((firstResult) => {
            if (firstResult.isConfirmed) {
                MySwal.fire({
                    title: 'Final Confirmation',
                    html: `
                <p style="margin-bottom: 10px;"><strong>This action cannot be undone!</strong></p>
                <p>Delete <span style="color: #EF4444; font-weight: bold;">${user.name}</span> permanently?</p>
              `,
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonColor: '#B91C1C',
                    cancelButtonColor: '#6B7280',
                    confirmButtonText: 'Yes, delete',
                    cancelButtonText: 'Back',
                }).then((secondResult) => {
                    if (secondResult.isConfirmed) {
                        onDelete(user._id);
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: `${user.name} has been removed.`,
                            showConfirmButton: false,
                            timer: 1800,
                        });
                    }
                });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <>
            <tr className="even:bg-gray-100">
                <td className="border rounded-2xl px-4 py-2 font-semibold text-blue-800">{user?.invitationCode}</td>
                <td className="border px-4 py-2">
                    ID: {user?.invitationCode}<br />
                    Username: {user?.username}<br />
                    Email: {user.email}<br />
                    Mobile: {user.phone}<br />
                    Invitation Code: {user.invitationCode}<br />
                    Reputation: {userReputation}
                </td>
                <td className="border px-4 py-2">Invitation User: {userSuperviser}</td>
                <td className="border px-4 py-2 font-semibold text-purple-600">{userVipLevel}</td>
                <td className="border px-4 py-2">
                    Wallet Balance: ৳{parseFloat(userTotalBal).toFixed(2)}<br />
                    Training Balance: ৳{parseFloat(userTrainingBal).toFixed(2)}<br />
                    Frozen: ৳{user.frozenBal}<br />
                    Recharge: ৳{parseFloat(userTotalDeposit).toFixed(2)}<br />
                    Withdraw: ৳{parseFloat(user.totalWithdraw).toFixed(2)}<br />
                    System Profit: ৳{user.systemProfit}
                </td>
                <td className="border px-4 py-2">
                    Done task: {userTaskCount}<br />
                    Total: {targetTask}<br />
                    Today Reset: {userResetCount}<br />
                </td>
                <td className="border px-4 py-2">
                    IP: {user.regInfo?.ip ? user.regInfo.ip : ""}<br />
                    City: {user.regInfo?.city ? user.regInfo.city : ""}<br />
                    Country: {user.regInfo?.country ? user.regInfo.country : ""}<br />
                    Time: {user.regInfo?.time ? new Date(user.regInfo.time).toLocaleString() : ""}
                </td>
                <td className="border px-4 py-2">
                    IP: {user.loginInfo?.ip ? user.loginInfo.ip : ""}<br />
                    City: {user.loginInfo?.city ? user.loginInfo.city : ""}<br />
                    Country: {user.loginInfo?.country ? user.loginInfo.country : ""}<br />
                    Time: {user.loginInfo?.time ? new Date(user.loginInfo.time).toLocaleString() : ""}
                </td>
            </tr>
            <tr>
                <td className="border px-4 py-2 col-span-3" colSpan="8">
                    <div className="grid grid-cols-5 gap-4 ">


                        <button
                            onClick={handleFreezeAcc}
                            className={`px-2 py-2 rounded text-white ${userFrozenStatus ? 'bg-yellow-600' : 'bg-blue-500'}`}
                        >
                            {userFrozenStatus ? 'Unfreeze Account' : 'Freeze Account'}
                        </button>

                        <button
                            onClick={handleWithdrawStatus}
                            className={`px-2 py-2 rounded font-semibold text-white
    ${userWithdrawStatus ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
  `}
                        >
                            {userWithdrawStatus ? "Restrict Withdraw" : "Unrestrict Withdraw"}
                        </button>


                        <button
                            onClick={handleRefferCodeStatus}
                            className={`px-2 py-2 rounded text-white font-semibold
    ${userRefferStatus ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
  `}
                        >
                            {userRefferStatus ? "Enable Invitation Code" : "Disable Invitation Code"}
                        </button>


                        <button onClick={handleModifyParent} className="bg-blue-500 text-white px-2 py-2 rounded">Modify Parent</button>


                        <button onClick={handleCredibility} className="bg-blue-500 text-white px-2 py-2 rounded">Credibility</button>


                        <button onClick={handleLoginPass} className="bg-blue-500 text-white px-2 py-2 rounded">Login Pass</button>

                        <button onClick={handleWithdrawPassword} className="bg-blue-500 text-white px-2 py-2 rounded">Withdraw Password</button>


                        <button onClick={handleAddMoney} className="bg-blue-500 text-white px-2 py-2 rounded">Add Money</button>

                        <button onClick={handleTrainingMoney} className="bg-blue-500 text-white px-2 py-2 rounded">Add Training Money</button>


                        <button onClick={handleVipLevel} className="bg-blue-500 text-white px-2 py-2 rounded">VIP Level</button>

                        <button onClick={handleCombinationTask} className="bg-blue-500 text-white px-2 py-2 rounded">Combination Task</button>

                        <button onClick={handleResetTask} className="bg-blue-500 text-white px-2 py-2 rounded">Reset Task</button>

                        <button onClick={handleDelete} className="bg-red-500 text-white px-2 py-2 rounded flex items-center justify-center gap-1"><FaTrash /> Delete</button>

                        <button onClick={handlePersonalPromotion} className="bg-blue-500 text-white px-2 py-2 rounded">Personal Promotion</button>

                        <button onClick={handleExtendTime} className="bg-blue-500 text-white px-2 py-2 rounded">Extend Time</button>

                    </div>
                </td>
            </tr>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
                    <div className="bg-white w-full max-h-screen overflow-auto p-4 rounded shadow-lg">
                        <CombinationTask user={user} onClose={handleCloseModal} />
                    </div>
                </div>
            )}

        </>
    );
};

export default Member;