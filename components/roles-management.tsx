"use client"

import { useState, useEffect } from 'react'
import { Crown, Shield, Users, UserCheck, UserPlus, Settings, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface UserRole {
  id: string
  user_id: string
  role: 'member' | 'officer' | 'vice_president' | 'president'
  assigned_at: string
  assigned_by?: string
  permissions: string[]
  is_active: boolean
  user?: {
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

interface RoleStats {
  total_members: number
  officers: number
  vice_presidents: number
  presidents: number
}

export default function RolesManagement() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [stats, setStats] = useState<RoleStats>({
    total_members: 0,
    officers: 0,
    vice_presidents: 0,
    presidents: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      
      if (data.success) {
        setRoles(data.data || [])
        calculateStats(data.data || [])
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (rolesData: UserRole[]) => {
    const stats = {
      total_members: rolesData.filter(r => r.role === 'member').length,
      officers: rolesData.filter(r => r.role === 'officer').length,
      vice_presidents: rolesData.filter(r => r.role === 'vice_president').length,
      presidents: rolesData.filter(r => r.role === 'president').length
    }
    setStats(stats)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'president':
        return <Crown className="size-4 text-yellow-500" />
      case 'vice_president':
        return <Shield className="size-4 text-blue-500" />
      case 'officer':
        return <UserCheck className="size-4 text-green-500" />
      case 'member':
        return <Users className="size-4 text-gray-500" />
      default:
        return <Users className="size-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'president':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'vice_president':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'officer':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'member':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'president':
        return ['Full Access', 'Manage All Roles', 'Admin Panel', 'Delete Events']
      case 'vice_president':
        return ['High Access', 'Manage Officers', 'Approve Events', 'Send Notifications']
      case 'officer':
        return ['Moderate Access', 'Create Events', 'Manage Resources', 'View Analytics']
      case 'member':
        return ['Basic Access', 'View Events', 'Join Events', 'Submit Feedback']
      default:
        return []
    }
  }

  const handleAssignRole = async (userId: string, role: string) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
          assignedBy: 'current-user-id' // Replace with actual user ID
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Role Assigned",
          description: `${role} role assigned successfully`,
        })
        loadRoles()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to assign role",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      })
    }
  }

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/roles?userId=${userId}&role=${role}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Role Removed",
          description: `${role} role removed successfully`,
        })
        loadRoles()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove role",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error removing role:', error)
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      })
    }
  }

  const filteredRoles = selectedRole === 'all' 
    ? roles 
    : roles.filter(role => role.role === selectedRole)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total_members}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <Users className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.officers}</p>
                <p className="text-sm text-muted-foreground">Officers</p>
              </div>
              <UserCheck className="size-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.vice_presidents}</p>
                <p className="text-sm text-muted-foreground">Vice Presidents</p>
              </div>
              <Shield className="size-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.presidents}</p>
                <p className="text-sm text-muted-foreground">Presidents</p>
              </div>
              <Crown className="size-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedRole === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('all')}
        >
          All Roles
        </Button>
        <Button
          variant={selectedRole === 'member' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('member')}
        >
          Members
        </Button>
        <Button
          variant={selectedRole === 'officer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('officer')}
        >
          Officers
        </Button>
        <Button
          variant={selectedRole === 'vice_president' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('vice_president')}
        >
          Vice Presidents
        </Button>
        <Button
          variant={selectedRole === 'president' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('president')}
        >
          Presidents
        </Button>
      </div>

      {/* Role List */}
      <div className="space-y-4">
        {filteredRoles.map((userRole) => (
          <Card key={userRole.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    <AvatarImage src={userRole.user?.avatar_url} />
                    <AvatarFallback>
                      {userRole.user?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {userRole.user?.first_name} {userRole.user?.last_name}
                      </h4>
                      {getRoleIcon(userRole.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {userRole.user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getRoleColor(userRole.role)}>
                        {userRole.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Assigned {new Date(userRole.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveRole(userRole.user_id, userRole.role)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              
              {/* Permissions */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {getRolePermissions(userRole.role).map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <UserPlus className="size-4 mr-2" />
              Assign New Role
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="size-4 mr-2" />
              Manage Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 