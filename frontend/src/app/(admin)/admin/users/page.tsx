'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Shield, User, Trash2, Mail } from 'lucide-react';
import { UserRole } from '@edtech/shared';
import { useAuth } from '@/lib/auth-context';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await apiClient.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRole(userId: string, newRole: UserRole) {
    try {
      await apiClient.updateUser(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      alert(error.message || 'Failed to update user role');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (userId === currentUser?.id) {
      alert("You cannot delete yourself!");
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await apiClient.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and their roles</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                    {user.id === currentUser?.id && (
                      <Badge variant="secondary" className="ml-2">You</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === UserRole.ADMIN ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.ADMIN)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.USER)}>
                          <User className="mr-2 h-4 w-4" />
                          Make User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

