/**
 * Admin Reports Page
 * View and manage reports
 */

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Report } from '@/types/api';

export const AdminReportsPage = () => {
  const { reports, isLoading, error, fetchReports, deletePost, deleteComment } = useAdmin();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const handleDeletePost = async (report: Report): Promise<void> => {
    if (report.type !== 'post') return;
    setDeletingId(report._id);
    try {
      await deletePost(report.targetId, `Eliminado por reporte: ${report.reason}`);
      await fetchReports(1);
    } catch (err) {
      // Error ya está manejado
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (report: Report): Promise<void> => {
    if (report.type !== 'comment') return;
    setDeletingId(report._id);
    try {
      await deleteComment(report.targetId);
      await fetchReports(1);
    } catch (err) {
      // Error ya está manejado
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <Button onClick={() => fetchReports(1)} variant="outline">
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{report.type}</CardTitle>
                <span className={`px-2 py-1 rounded text-xs ${
                  report.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : report.status === 'resolved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {report.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {report.reporter.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{report.reporter.username}</p>
                  <p className="text-sm text-muted-foreground">{report.reporter.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Razón del reporte:</p>
                <p className="text-sm">{report.reason}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="flex gap-2">
                {report.status === 'pending' && (
                  <>
                    {report.type === 'post' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(report)}
                        disabled={deletingId === report._id}
                      >
                        {deletingId === report._id ? 'Eliminando...' : 'Eliminar Publicación'}
                      </Button>
                    )}
                    {report.type === 'comment' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteComment(report)}
                        disabled={deletingId === report._id}
                      >
                        {deletingId === report._id ? 'Eliminando...' : 'Eliminar Comentario'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay reportes pendientes</p>
        </div>
      )}
    </div>
  );
};

