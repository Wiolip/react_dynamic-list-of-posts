import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';
import { client } from './utils/fetchClient';

import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { Comment } from './types/Comment';
import { Post } from './types/Post';
import { User } from './types/User';

export const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(false);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await client.get<User[]>('/users');

        setUsers(data);
      } catch {
        // opcjonalnie obsłużyć
      }
    };

    loadUsers();
  }, []);

  //Load post
  // Load posts
  useEffect(() => {
    if (!selectedUser) {
      setPosts([]);
      setSelectedPost(null);

      return;
    }

    let isMounted = true;

    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(false);
        setSelectedPost(null);

        const data = await client.get<Post[]>(
          `/posts?userId=${selectedUser.id}`,
        );

        if (isMounted) {
          setPosts(data);
        }
      } catch {
        if (isMounted) {
          setPostsError(true);
        }
      } finally {
        if (isMounted) {
          setPostsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [selectedUser]);

  // Load comments
  useEffect(() => {
    if (!selectedPost) {
      setComments([]);

      return;
    }

    let isMounted = true;

    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentsError(false);

        const data = await client.get<Comment[]>(
          `/comments?postId=${selectedPost.id}`,
        );

        if (isMounted) {
          setComments(data);
        }
      } catch {
        if (isMounted) {
          setCommentsError(true);
        }
      } finally {
        if (isMounted) {
          setCommentsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [selectedPost]);

  const handleCommentDelete = async (id: number) => {
    const previous = [...comments];

    setComments(prev => prev.filter(comment => comment.id !== id));

    try {
      await client.delete(`/comments/${id}`);
    } catch {
      setComments(previous);
    }
  };

  const handleCommentAdd = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  const noPosts =
    !postsLoading && !postsError && selectedUser && posts.length === 0;

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  users={users}
                  selectedUser={selectedUser}
                  onSelected={setSelectedUser}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUser && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {postsLoading && <Loader />}

                {postsError && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    Something went wrong!
                  </div>
                )}

                {noPosts && (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    No posts yet
                  </div>
                )}

                {!postsLoading && !postsError && posts.length > 0 && (
                  <PostsList
                    posts={posts}
                    selectedPost={selectedPost}
                    onSelect={setSelectedPost}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              { 'Sidebar--open': selectedPost },
            )}
          >
            <div className="tile is-child box is-success">
              {selectedPost && (
                <PostDetails
                  post={selectedPost}
                  comments={comments}
                  commentsLoading={commentsLoading}
                  commentsError={commentsError}
                  onCommentDelete={handleCommentDelete}
                  onCommentAdd={handleCommentAdd}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
