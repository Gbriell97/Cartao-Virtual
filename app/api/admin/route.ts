import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "list_users") {
      const {
        data: usersData,
        error: usersError,
      } = await supabaseAdmin.auth.admin.listUsers();

      if (usersError) {
        throw usersError;
      }

      const userIds = usersData.users.map((item) => item.id);

      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("user_profiles")
        .select("id,name,max_cards,role")
        .in("id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      const users = usersData.users.map((authUser) => {
        const profileData = profiles?.find(
          (item) => item.id === authUser.id
        );

        return {
          id: authUser.id,
          email: authUser.email,
          name: profileData?.name || "Usuário",
          role: profileData?.role || "user",
          maxCards: profileData?.max_cards ?? 1,
          createdAt: authUser.created_at,
        };
      });

      return NextResponse.json({ users });
    }

    if (action === "create_user") {
      const {
        name,
        email,
        password,
        role = "user",
        maxCards = 1,
      } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Nome, e-mail e senha são obrigatórios." },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter pelo menos 6 caracteres." },
          { status: 400 }
        );
      }

      if (!["admin", "user"].includes(role)) {
        return NextResponse.json(
          { error: "Perfil inválido." },
          { status: 400 }
        );
      }

      const parsedMaxCards = Number(maxCards);

      if (
        !Number.isInteger(parsedMaxCards) ||
        parsedMaxCards < 1
      ) {
        return NextResponse.json(
          { error: "O limite de cartões deve ser um número inteiro maior que zero." },
          { status: 400 }
        );
      }

      const {
        data: createdUser,
        error: createError,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
        },
      });

      if (createError || !createdUser.user) {
        throw createError || new Error("Não foi possível criar o usuário.");
      }

      const { error: profileCreateError } = await supabaseAdmin
        .from("user_profiles")
        .upsert({
          id: createdUser.user.id,
          name,
          role,
          max_cards: parsedMaxCards,
        });

      if (profileCreateError) {
        await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
        throw profileCreateError;
      }

      return NextResponse.json({
        success: true,
        userId: createdUser.user.id,
      });
    }

    if (action === "delete_user") {
      const { userId } = body;

      if (!userId) {
        return NextResponse.json(
          { error: "Usuário não informado." },
          { status: 400 }
        );
      }

      if (userId === user.id) {
        return NextResponse.json(
          { error: "Você não pode excluir o próprio usuário." },
          { status: 400 }
        );
      }

      const { error: deleteError } =
        await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        throw deleteError;
      }

      return NextResponse.json({ success: true });
    }

    if (action === "reset_password") {
      const { userId, password } = body;

      if (!userId || !password) {
        return NextResponse.json(
          { error: "Usuário e senha são obrigatórios." },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter pelo menos 6 caracteres." },
          { status: 400 }
        );
      }

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
        });

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ success: true });
    }

    if (action === "set_max_cards") {
      const { userId, maxCards } = body;

      const parsedMaxCards = Number(maxCards);

      if (
        !userId ||
        !Number.isInteger(parsedMaxCards) ||
        parsedMaxCards < 1
      ) {
        return NextResponse.json(
          { error: "Usuário ou limite de cartões inválido." },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          max_cards: parsedMaxCards,
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Ação administrativa desconhecida." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro na API administrativa:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}