import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { checkStaffContract, isContractActive } from '../apis/staff.api';
import ContractStatusMessage from './ContractStatusMessage';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "staff" | "customer">;
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/home" 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const [contractStatus, setContractStatus] = useState<{
    isLoading: boolean;
    isValid: boolean;
    reason?: 'no_contract' | 'inactive' | 'expired';
  }>({
    isLoading: false,
    isValid: true,
  });

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const userRole = user.role;
  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate page based on user role
    const roleRedirectMap: Record<string, string> = {
      admin: "/admin",
      staff: "/partner", 
      customer: "/home"
    };
    
    return <Navigate to={roleRedirectMap[userRole] || redirectTo} replace />;
  }

  // Additional contract check for staff accessing partner pages
  useEffect(() => {
    const checkContract = async () => {
      // Only check contract for staff role
      if (userRole === 'staff' && allowedRoles.includes('staff')) {
        setContractStatus({ isLoading: true, isValid: true });
        
        try {
          const contractResponse = await checkStaffContract();
          
          if (!contractResponse.result) {
            setContractStatus({ 
              isLoading: false, 
              isValid: false, 
              reason: 'no_contract' 
            });
            return;
          }

          if (!isContractActive(contractResponse)) {
            const { status, end_date } = contractResponse.result;
            const now = new Date();
            const endDate = new Date(end_date);
            
            let reason: 'inactive' | 'expired' = 'inactive';
            if (status === 'active' && now > endDate) {
              reason = 'expired';
            }
            
            setContractStatus({ 
              isLoading: false, 
              isValid: false, 
              reason 
            });
            return;
          }

          setContractStatus({ isLoading: false, isValid: true });
        } catch (error) {
          console.error('Error checking staff contract:', error);
          setContractStatus({ 
            isLoading: false, 
            isValid: false, 
            reason: 'no_contract' 
          });
        }
      }
    };

    checkContract();
  }, [userRole, allowedRoles]);

  // Show loading state while checking contract
  if (contractStatus.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show contract status message if contract is not valid
  if (!contractStatus.isValid && contractStatus.reason) {
    return <ContractStatusMessage reason={contractStatus.reason} />;
  }

  // If authenticated, role is allowed, and contract is valid (for staff), render the children
  return <>{children}</>;
};

export default RoleProtectedRoute;
